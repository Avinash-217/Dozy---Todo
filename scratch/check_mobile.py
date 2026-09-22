from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={'width': 375, 'height': 667})
    page.goto('http://localhost:3000')
    page.wait_for_timeout(800)

    # 1. Dashboard
    page.screenshot(path='scratch/mobile_dashboard.png', full_page=True)

    # 2. Calendar
    page.locator(".mobile-nav-item[data-view='calendar']").click()
    page.wait_for_timeout(600)
    page.screenshot(path='scratch/mobile_calendar.png', full_page=True)

    # 3. History
    page.locator(".mobile-nav-item[data-view='history']").click()
    page.wait_for_timeout(600)
    page.screenshot(path='scratch/mobile_history.png', full_page=True)

    # 4. Notes
    page.evaluate("window.navigateView('notes')")
    page.wait_for_timeout(600)
    page.screenshot(path='scratch/mobile_notes.png', full_page=True)

    # 5. Analytics
    page.locator(".mobile-nav-item[data-view='analytics']").click()
    page.wait_for_timeout(600)
    page.screenshot(path='scratch/mobile_analytics.png', full_page=True)

    # 6. Notification dropdown
    page.locator('#notificationBellBtn').click()
    page.wait_for_timeout(400)
    page.screenshot(path='scratch/mobile_notif_dropdown.png')
    page.locator('#notificationBellBtn').click()
    page.wait_for_timeout(300)

    # 7. Add task modal
    page.locator('#mobileFab').click()
    page.wait_for_timeout(400)
    page.screenshot(path='scratch/mobile_add_modal.png')
    page.locator('#closeModalBtn').click()
    page.wait_for_timeout(300)

    # Measure overflows across all 5 views
    views = ['dashboard', 'calendar', 'history', 'notes', 'analytics']
    overflow_report = {}
    for v in views:
        page.evaluate(f"window.navigateView('{v}')")
        page.wait_for_timeout(400)
        scroll_w = page.evaluate('document.documentElement.scrollWidth')
        client_w = page.evaluate('document.documentElement.clientWidth')
        overflowing = page.evaluate('''() => {
            const bad = [];
            const docWidth = document.documentElement.clientWidth;
            for (let el of document.querySelectorAll('*')) {
                const rect = el.getBoundingClientRect();
                if (rect.right > docWidth + 1) {
                    bad.push({
                        tag: el.tagName,
                        className: (el.className || '').toString().slice(0, 35),
                        id: el.id,
                        right: Math.round(rect.right),
                        width: Math.round(rect.width)
                    });
                }
            }
            return bad.slice(0, 10);
        }''')
        overflow_report[v] = {
            'scrollWidth': scroll_w,
            'clientWidth': client_w,
            'overflowCount': len(overflowing),
            'samples': overflowing[:4]
        }

    import pprint
    pprint.pprint(overflow_report)
    browser.close()
