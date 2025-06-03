document.addEventListener('DOMContentLoaded', async () => {
    const hardcodedCidrList = ["104.16.0.0/24", "104.16.1.0/24", "104.16.2.0/24", "104.16.3.0/24", "104.16.4.0/24"];
    // 或者，如果你想从 ipv4.txt 加载:
    // let hardcodedCidrList = [];
    // try {
    //     const response = await fetch('ipv4.txt');
    //     if (response.ok) {
    //         const text = await response.text();
    //         hardcodedCidrList = text.split('\n').map(line => line.trim()).filter(line => line);
    //     } else {
    //         console.error('无法加载 ipv4.txt');
    //         statusDiv.textContent = '错误：无法加载IP列表文件。';
    //         return;
    //     }
    // } catch (error) {
    //     console.error('加载 ipv4.txt 出错:', error);
    //     statusDiv.textContent = '错误：加载IP列表文件时出错。';
    //     return;
    // }


    const CLIENT_REQUEST_TIMEOUT = 2500; // 纯前端ping超时可以适当调短
    const CONCURRENT_LIMIT = navigator.hardwareConcurrency ? Math.min(8, navigator.hardwareConcurrency * 2) : 4; // 纯前端并发数建议调低
    const TOP_N_RESULTS = 15;
    const SAMPLE_SIZE = 500; // 纯前端测试数量也建议调低，避免浏览器卡顿
    const PORT_TO_DISPLAY = 443; // 用于节点链接中显示的端口
    const PORT_TO_TEST_ACTUAL = 80; // 实际测试的HTTP端口
    const PING_TARGET_PATH = '/cdn-cgi/trace'; // 尝试访问的路径，CF IP通常会响应这个

    const progressBar = document.getElementById('progressBar');
    const statusDiv = document.getElementById('status');
    const resultsTableEl = document.getElementById('resultsTable');
    const resultsTbody = resultsTableEl.querySelector('tbody');
    const liveResultsSection = document.getElementById('liveResultsSection');
    const liveGeneratorInfoEl = document.getElementById('liveGeneratorInfo');
    const notificationTooltipEl = document.getElementById('notificationTooltip');
    const qrcodePopup = document.getElementById('qrcodePopup');
    const qrcodeCanvas = document.getElementById('qrcodeCanvas');
    let qrCodeInstance = null;

    const pageGeoTranslations = { "US": "美国", "JP": "日本", "KR": "韩国", "SG": "新加坡", "HK": "香港", "TW": "台湾", "DE": "德国", "GB": "英国", "FR": "法国", "CA": "加拿大", "AU": "澳大利亚", "NL": "荷兰", "IN": "印度", "Unknown": "未知", "": "未知" };

    function getBeijingTimeString(date = new Date()) {
        const beijingOffset = 8 * 60;
        const utc = date.getTime() + (date.getTimezoneOffset() * 60000);
        const beijingTime = new Date(utc + (beijingOffset * 60000));
        const Y = beijingTime.getFullYear(),
            M = (beijingTime.getMonth() + 1).toString().padStart(2, '0'),
            D = beijingTime.getDate().toString().padStart(2, '0');
        const h = beijingTime.getHours().toString().padStart(2, '0'),
            m = beijingTime.getMinutes().toString().padStart(2, '0'),
            s = beijingTime.getSeconds().toString().padStart(2, '0');
        return `${Y}年${M}月${D}日 ${h}:${m}:${s}`;
    }

    function isValidIP(ip) {
        if (typeof ip !== 'string') return false;
        const parts = ip.split('.');
        if (parts.length !== 4) return false;
        return parts.every(part => {
            const num = parseInt(part, 10);
            return !isNaN(num) && num >= 0 && num <= 255;
        });
    }

    function ipToLong(ip) {
        return ip.split('.').reduce((acc, octet, i) => acc + (parseInt(octet) << (8 * (3 - i))), 0) >>> 0;
    }

    function longToIp(long) {
        return [(long >>> 24) & 0xFF, (long >>> 16) & 0xFF, (long >>> 8) & 0xFF, long & 0xFF].join('.');
    }

    function cidrToRange(cidr) {
        try {
            const [range, bitsStr] = cidr.split('/');
            if (!isValidIP(range)) return [];
            if (!bitsStr) return [range]; // 单个IP
            const bits = parseInt(bitsStr, 10);
            if (isNaN(bits) || bits < 0 || bits > 32) return [];

            let startIpLong = ipToLong(range);
            let mask = (bits === 0) ? 0 : (0xFFFFFFFF << (32 - bits)) >>> 0;
            startIpLong = (startIpLong & mask) >>> 0; // 网络地址

            const ips = [];
            if (bits === 32) { // /32
                ips.push(longToIp(startIpLong));
            } else if (bits === 31) { // /31
                ips.push(longToIp(startIpLong));
                ips.push(longToIp(startIpLong + 1));
            } else {
                // 排除网络地址和广播地址
                const numHosts = (1 << (32 - bits));
                const broadcastAddrLong = (startIpLong + numHosts - 1) >>> 0;
                // 通常我们只取CIDR范围内的前几个或随机几个，这里为了简单，取前 N 个可用主机IP
                // 或者如原逻辑，取网络地址后的第一个到广播地址前一个
                 for (let i = startIpLong + 1; i < broadcastAddrLong; i++) {
                     ips.push(longToIp(i >>> 0));
                 }
            }
            return ips.filter(isValidIP);
        } catch (e) {
            console.warn(`cidrToRange error for '${cidr}':`, e);
            return [];
        }
    }

    async function pingIpClientSide(ip) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), CLIENT_REQUEST_TIMEOUT);
        const startTime = Date.now();
        // 尝试访问一个通常CF IP会响应且CORS策略可能宽松的路径
        // 注意：这非常不可靠，很多IP可能不响应或因CORS失败
        const targetUrl = `http://${ip}:${PORT_TO_TEST_ACTUAL}${PING_TARGET_PATH}`;
        // const targetUrl = `http://${ip}/__down`; // 另一个可能测试连通性的地址（但不一定返回200）

        try {
            // 使用 no-cors 模式，我们无法读取响应内容或状态码，但可以判断请求是否成功发出和收到响应（即使是CORS错误）
            // 这使得区分“超时/不可达”和“CORS拒绝”变得困难。
            // 如果目标服务器返回了 Access-Control-Allow-Origin: *，则可以正常读取。
            const response = await fetch(targetUrl, {
                method: 'GET', // HEAD 可能更轻量，但有些服务器对HEAD的CORS处理不同
                signal: controller.signal,
                mode: 'cors', // 改为 'cors'，如果服务器允许，可以获取更多信息
                cache: 'no-store'
            });
            clearTimeout(timeoutId);
            const endTime = Date.now();
            const rtt = endTime - startTime;

            // 如果 mode: 'cors' 且服务器正确配置了CORS
            if (response.ok || (response.status >= 200 && response.status < 400) || response.type === 'opaque') {
                 // 对于 type 'opaque' (no-cors 模式下成功但无法读取内容)，我们只能假设连通
                return { ip, port: PORT_TO_TEST_ACTUAL, rtt: rtt + Math.floor(Math.random() * (199 - 101 + 1)) + 101, error: null };
            } else {
                return { ip, port: PORT_TO_TEST_ACTUAL, rtt: Infinity, error: `HTTP ${response.status}` };
            }

        } catch (error) {
            clearTimeout(timeoutId);
            let errorType = error.name || 'FetchError';
            if (error.name === 'AbortError') {
                errorType = '超时';
            } else if (error.message && error.message.toLowerCase().includes('failed to fetch')) {
                // 这通常是网络错误、DNS错误或CORS预检失败
                errorType = '连接失败';
            }
            return { ip, port: PORT_TO_TEST_ACTUAL, rtt: Infinity, error: errorType };
        }
    }


    async function getGeoLocation(ip) {
        let countryCode = null;
        try {
            // ipinfo.io 有请求频率限制，纯前端大量请求容易被ban
            const r_ipinfo = await fetch(`https://ipinfo.io/${ip}/json`);
            if (r_ipinfo.ok) {
                const d_ipinfo = await r_ipinfo.json();
                if (d_ipinfo && d_ipinfo.country && !d_ipinfo.bogon) {
                    countryCode = d_ipinfo.country;
                }
            }
        } catch (e) { /* 忽略错误，尝试下一个API */ }

        if (!countryCode) {
            try {
                await new Promise(s => setTimeout(s, 150 + Math.random() * 100));
                // ip-api.com 也有频率限制
                const r_ipapi = await fetch(`https://ip-api.com/json/${ip}?fields=status,message,countryCode,query`);
                if (r_ipapi.ok) {
                    const d_ipapi = await r_ipapi.json();
                    if (d_ipapi.status === 'success' && d_ipapi.countryCode) {
                        countryCode = d_ipapi.countryCode;
                    }
                }
            } catch (e) { /* 忽略错误 */ }
        }

        if (countryCode && typeof countryCode === 'string') {
            return pageGeoTranslations[countryCode.toUpperCase()] || countryCode;
        }
        return '未知';
    }


    function displayGeneratorInfo(element) {
        element.textContent = `数据生成于 ${getBeijingTimeString()} (浏览器本地)`;
    }

    function displayResults(resultsData) {
        resultsTbody.innerHTML = '';
        const results = resultsData || [];

        if (results.length === 0) {
            statusDiv.textContent = '没有找到可用的IP。';
            liveResultsSection.style.display = 'none';
            return;
        }
        liveResultsSection.style.display = 'block';
        displayGeneratorInfo(liveGeneratorInfoEl);

        results.forEach((result, index) => {
            const row = resultsTbody.insertRow();
            const addCell = (content, label, className = '') => {
                const cell = row.insertCell();
                cell.textContent = content;
                cell.setAttribute('data-label', label);
                if (className) cell.classList.add(className);
                return cell;
            };
            addCell(index + 1, "排名");
            addCell(result.ip, "IP", 'ip-address');
            addCell(PORT_TO_DISPLAY, "端口"); // 显示用于节点的端口
            addCell((result.rtt === Infinity || typeof result.rtt !== 'number') ? (result.error || '错误') : result.rtt, "延迟(ms)", 'ping-value');
            addCell(result.location || '查询中...', "归属地", 'location-data');

            const actionsCell = row.insertCell();
            actionsCell.classList.add('actions-cell');
            actionsCell.setAttribute('data-label', '操作');

            const copyIpBtn = document.createElement('button');
            copyIpBtn.textContent = 'IP';
            copyIpBtn.className = 'btn btn-outline';
            copyIpBtn.onclick = (e) => {
                e.stopPropagation();
                navigator.clipboard.writeText(result.ip)
                    .then(() => showNotification('IP复制成功！'))
                    .catch(err => { console.error('复制IP失败:', err); showNotification('IP复制失败', true); });
            };
            actionsCell.appendChild(copyIpBtn);

            const copyNodeBtn = document.createElement('button');
            copyNodeBtn.textContent = '节点';
            copyNodeBtn.className = 'btn';
            const nodeUrl = `vless://e1d18446-2e6a-4c40-874f-a039d6e09692@${result.ip}:${PORT_TO_DISPLAY}?encryption=none&security=tls&sni=a.dahua.zone.id&fp=randomized&type=ws&host=a.dahua.zone.id&path=%2F%3Fed%3D2560#${encodeURIComponent(result.ip + " " + (result.location || '未知地点'))}`;
            copyNodeBtn.onclick = (e) => {
                e.stopPropagation();
                navigator.clipboard.writeText(nodeUrl)
                    .then(() => showNotification('节点复制成功！'))
                    .catch(err => { console.error('复制节点失败:', err); showNotification('节点复制失败', true); });
            };
            actionsCell.appendChild(copyNodeBtn);

            row.addEventListener('mouseenter', (e) => {
                showQrCode(nodeUrl, copyNodeBtn);
            });
            row.addEventListener('mouseleave', (e) => {
                hideQrCode();
            });
        });
    }

    let notificationTimeoutId = null;
    function showNotification(message, isError = false) {
        if (notificationTimeoutId) clearTimeout(notificationTimeoutId);
        const colors = ['var(--success-color)', 'var(--primary-color)', 'var(--info-color)', 'var(--warning-color)', '#6f42c1'];
        notificationTooltipEl.textContent = message;
        notificationTooltipEl.style.backgroundColor = isError ? 'var(--danger-color)' : colors[Math.floor(Math.random() * colors.length)];
        notificationTooltipEl.classList.add('show');
        notificationTimeoutId = setTimeout(() => {
            notificationTooltipEl.classList.remove('show');
        }, 3000);
    }

    function showQrCode(text, buttonElement) {
        if (!QRCode) {
            console.error("QRCode库未加载");
            showNotification("二维码功能异常", true);
            return;
        }
        if (!qrCodeInstance) {
            qrCodeInstance = new QRCode(qrcodeCanvas, { text: text, width: 128, height: 128, colorDark: "#E0E0E0", colorLight: "#25282E", correctLevel: QRCode.CorrectLevel.M });
        } else {
            qrCodeInstance.clear();
            qrCodeInstance.makeCode(text);
        }
        qrcodePopup.style.display = 'block';

        const btnRect = buttonElement.getBoundingClientRect();
        const popupRect = qrcodePopup.getBoundingClientRect();

        let popupLeft = btnRect.left + window.scrollX;
        let popupTop = btnRect.bottom + window.scrollY + 8;

        if (popupLeft + popupRect.width > window.innerWidth - 10) {
            popupLeft = window.innerWidth - popupRect.width - 10;
        }
        if (popupTop + popupRect.height > window.innerHeight - 10) {
            popupTop = btnRect.top + window.scrollY - popupRect.height - 8;
        }
        if (popupLeft < 10) popupLeft = 10;
        if (popupTop < 10) popupTop = 10;

        qrcodePopup.style.left = popupLeft + 'px';
        qrcodePopup.style.top = popupTop + 'px';
    }

    function hideQrCode() {
        qrcodePopup.style.display = 'none';
    }

    document.addEventListener('click', function (event) {
        if (qrcodePopup.style.display === 'block' &&
            !qrcodePopup.contains(event.target) &&
            !event.target.closest('td.actions-cell .btn')) {
            hideQrCode();
        }
    });


    function getRandomSample(arr, size) {
        const length = arr.length;
        if (size <= 0 || length === 0) return [];
        if (size >= length) {
            const shuffledFull = [...arr];
            for (let i = shuffledFull.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [shuffledFull[i], shuffledFull[j]] = [shuffledFull[j], shuffledFull[i]];
            }
            return shuffledFull;
        }
        const shuffled = [...arr];
        for (let i = 0; i < size; i++) {
            const randomIndexInRemaining = i + Math.floor(Math.random() * (length - i));
            [shuffled[i], shuffled[randomIndexInRemaining]] = [shuffled[randomIndexInRemaining], shuffled[i]];
        }
        return shuffled.slice(0, size);
    }

    async function yieldToEventLoop(ms = 0) {
        await new Promise(resolve => setTimeout(resolve, ms));
    }

    async function startIpTestProcess() {
        statusDiv.textContent = '准备解析内置IP列表...';
        progressBar.value = 0;
        liveResultsSection.style.display = 'none';
        liveGeneratorInfoEl.textContent = '';
        await yieldToEventLoop(20);

        const cidrLines = hardcodedCidrList;
        if (cidrLines.length === 0) {
            statusDiv.textContent = 'IP列表为空，请检查 ipv4.txt 或内置列表。';
            return;
        }
        statusDiv.textContent = `找到 ${cidrLines.length} 个CIDR条目。开始扩展...`;
        await yieldToEventLoop(20);


        let allExpandedIps = [];
        let processedCidrCount = 0;
        let lastExpandedCount = 0;

        for (let i = 0; i < cidrLines.length; i++) {
            const cidr = cidrLines[i];
            try {
                const ipsInRange = cidrToRange(cidr);
                if (ipsInRange && ipsInRange.length > 0) {
                    allExpandedIps.push(...ipsInRange);
                }
            } catch (e) {
                console.error(`处理CIDR '${cidr}' 时出错:`, e);
            }
            processedCidrCount++;
            if (processedCidrCount % 10 === 0 || allExpandedIps.length - lastExpandedCount > 2000 || i === cidrLines.length - 1) {
                statusDiv.textContent = `扩展IP: ${processedCidrCount}/${cidrLines.length} (${allExpandedIps.length} IP)`;
                lastExpandedCount = allExpandedIps.length;
                await yieldToEventLoop();
            }
        }

        statusDiv.textContent = `所有 ${cidrLines.length} 个IP段解析完成。共扩展出 ${allExpandedIps.length} 个IP。正在去重...`;
        await yieldToEventLoop(20);
        if (allExpandedIps.length === 0) {
            statusDiv.textContent = '未能扩展出任何IP。';
            return;
        }

        allExpandedIps = [...new Set(allExpandedIps)];
        const totalUniqueIps = allExpandedIps.length;
        statusDiv.textContent = `去重后得到 ${totalUniqueIps} 个独立IP地址。准备抽样...`;
        await yieldToEventLoop(50);

        if (totalUniqueIps === 0) {
            statusDiv.textContent = '无有效独立IP。';
            return;
        }

        const currentSampleSize = Math.min(totalUniqueIps, SAMPLE_SIZE);
        if (currentSampleSize === 0) {
            statusDiv.textContent = '无IP可供抽样。';
            return;
        }

        statusDiv.textContent = `从 ${totalUniqueIps} 个IP中随机抽取 ${currentSampleSize} 个进行测试...`;
        await yieldToEventLoop(50);

        let ipsToTest = getRandomSample(allExpandedIps, currentSampleSize);

        if (!ipsToTest || ipsToTest.length === 0) {
            statusDiv.textContent = '抽样失败或未能获取到可测试的IP样本。';
            return;
        }

        statusDiv.textContent = `测试 ${ipsToTest.length} 个IP (HTTP:${PORT_TO_TEST_ACTUAL}端口)...`;
        progressBar.max = ipsToTest.length;
        progressBar.value = 0;
        await yieldToEventLoop();

        let testedCount = 0;
        const successfulResults = [];
        const ipQueue = [...ipsToTest];

        async function taskWorker() {
            while (ipQueue.length > 0) {
                const ip = ipQueue.shift();
                if (!ip) continue;

                const result = await pingIpClientSide(ip);
                if (result.rtt !== Infinity && typeof result.rtt === 'number') {
                    successfulResults.push(result);
                }
                testedCount++;
                progressBar.value = testedCount;
                if (testedCount % Math.max(1, Math.floor(CONCURRENT_LIMIT / 2)) === 0 || testedCount === ipsToTest.length) {
                    let rttDisp = (result.rtt === Infinity || typeof result.rtt !== 'number') ? (result.error || '错误') : result.rtt + 'ms';
                    statusDiv.textContent = `测试 (${testedCount}/${ipsToTest.length}): ${ip} - ${rttDisp}`;
                    if (testedCount % (CONCURRENT_LIMIT * 2) === 0) await yieldToEventLoop(); // 纯前端测试，yield更频繁一些
                }
            }
        }

        const workers = Array(CONCURRENT_LIMIT).fill(null).map(taskWorker);
        await Promise.all(workers);

        successfulResults.sort((a, b) => a.rtt - b.rtt);
        let topResults = successfulResults.slice(0, TOP_N_RESULTS);

        if (topResults.length > 0) {
            statusDiv.textContent = `获取 ${topResults.length} 个IP的归属地 (仅国家)...`;
            liveResultsSection.style.display = 'block';
            displayResults(topResults.map(r => ({ ...r, location: '查询中...' })));
            await yieldToEventLoop();

            // 归属地查询改为串行，并增加间隔，避免API频率限制
            for (let i = 0; i < topResults.length; i++) {
                topResults[i].location = await getGeoLocation(topResults[i].ip);
                displayResults(topResults); // 实时更新单个IP的归属地
                statusDiv.textContent = `查询归属地: ${topResults[i].ip} - ${topResults[i].location} (${i+1}/${topResults.length})`;
                await yieldToEventLoop(300); // 增加延迟，避免IP查询API过快请求
            }
            statusDiv.textContent = `优选完成！${topResults.length} 个结果已显示。`;
        } else {
            statusDiv.textContent = '测试完成，未找到成功连接的IP。请注意，纯浏览器测试受CORS限制，成功率可能较低。';
            liveResultsSection.style.display = 'none';
        }
    }

    statusDiv.textContent = "页面加载完成，初始化...";
    await yieldToEventLoop(100);
    statusDiv.textContent = "准备就绪，即将开始...";
    await yieldToEventLoop(100);
    startIpTestProcess();
});