from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={'width': 375, 'height': 667})
    page.goto('http://localhost:3000')
    page.locator('#mobileFab').click()
    page.wait_for_timeout(300)

    html = page.evaluate('document.querySelector("#modalTypeGroup").outerHTML')
    print('HTML:', html)

    styles = page.evaluate('''() => {
        const btn = document.querySelector('#modalTypeGroup .capture-tab-btn.active');
        const cs = window.getComputedStyle(btn);
        return {
            background: cs.backgroundColor,
            color: cs.color,
            height: cs.height,
            lineHeight: cs.lineHeight,
            display: cs.display,
            padding: cs.padding,
            fontSize: cs.fontSize
        };
    }''')
    print('STYLES:', styles)

    # Check parent
    pstyles = page.evaluate('''() => {
        const p = document.querySelector('#modalTypeGroup');
        const cs = window.getComputedStyle(p);
        return {
            background: cs.backgroundColor,
            height: cs.height,
            display: cs.display,
            padding: cs.padding
        };
    }''')
    print('PARENT STYLES:', pstyles)
    browser.close()
