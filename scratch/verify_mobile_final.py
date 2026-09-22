from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={'width': 375, 'height': 667})
    page.goto('http://localhost:3000')
    page.wait_for_timeout(1000)

    views = ['dashboard', 'calendar', 'history', 'notes', 'analytics']
    results = {}

    for v in views:
        page.evaluate(f"window.navigateView('{v}')")
        page.wait_for_timeout(600)

        scroll_w = page.evaluate('document.documentElement.scrollWidth')
        client_w = page.evaluate('document.documentElement.clientWidth')

        overflows = page.evaluate('''() => {
            const bad = [];
            const docWidth = document.documentElement.clientWidth;
            for (let el of document.querySelectorAll('*')) {
                const rect = el.getBoundingClientRect();
                if (rect.right > docWidth + 0.5) {
                    bad.push({
                        tag: el.tagName,
                        className: (el.className || '').toString().slice(0, 35),
                        right: Math.round(rect.right),
                        width: Math.round(rect.width)
                    });
                }
            }
            return bad;
        }''')

        # Take screenshot of the view (viewport only, like a real phone)
        page.screenshot(path=f'scratch/final_mobile_{v}.png')

        results[v] = {
            'scrollWidth': scroll_w,
            'clientWidth': client_w,
            'overflowCount': len(overflows),
            'overflows': overflows[:5]
        }

    # Test notification dropdown on mobile
    page.evaluate("window.navigateView('dashboard')")
    page.wait_for_timeout(400)
    page.locator('#notificationBellBtn').click()
    page.wait_for_timeout(400)
    notif_rect = page.evaluate('''() => {
        const dd = document.querySelector('#notificationDropdown');
        const rect = dd.getBoundingClientRect();
        return {
            left: Math.round(rect.left),
            right: Math.round(rect.right),
            width: Math.round(rect.width),
            docWidth: document.documentElement.clientWidth
        };
    }''')
    page.screenshot(path='scratch/final_mobile_notif.png')
    page.locator('#notificationBellBtn').click()
    page.wait_for_timeout(300)

    # Test Add modal on mobile
    page.locator('#mobileFab').click()
    page.wait_for_timeout(400)
    modal_rect = page.evaluate('''() => {
        const modal = document.querySelector('.modal-sheet');
        const rect = modal.getBoundingClientRect();
        return {
            left: Math.round(rect.left),
            right: Math.round(rect.right),
            width: Math.round(rect.width),
            docWidth: document.documentElement.clientWidth
        };
    }''')
    page.screenshot(path='scratch/final_mobile_modal.png')

    import pprint
    print("=== OVERFLOW ANALYSIS ACROSS ALL VIEWS ===")
    pprint.pprint(results)
    print("=== NOTIFICATION DROPDOWN RECT ===")
    pprint.pprint(notif_rect)
    print("=== MODAL RECT ===")
    pprint.pprint(modal_rect)

    browser.close()
