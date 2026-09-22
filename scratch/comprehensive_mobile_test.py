import json
from playwright.sync_api import sync_playwright

def run_mobile_audit():
    with sync_playwright() as p:
        iphone = p.devices['iPhone 14']
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(**iphone)
        page = context.new_page()

        console_logs = []
        errors = []
        page.on("console", lambda msg: console_logs.append(f"[{msg.type}] {msg.text}"))
        page.on("pageerror", lambda err: errors.append(str(err)))

        page.goto('http://localhost:3000')
        page.wait_for_load_state('networkidle')
        page.wait_for_timeout(600)

        results = {
            "device": "iPhone 14 (390x844, DPR 3, Touch)",
            "views": {},
            "touch_target_issues": [],
            "overflow_issues": [],
            "redundant_elements_detected": [],
            "console_errors": []
        }

        # 1. Inspect Top Header on Mobile
        header_info = page.evaluate('''() => {
            const header = document.querySelector('.top-header');
            const quickAddBtn = document.querySelector('#headerQuickAddBtn');
            const searchBar = document.querySelector('.header-search');
            const notifBtn = document.querySelector('#notificationBellBtn');
            const brand = document.querySelector('.top-header-mobile-brand');
            return {
                headerHeight: header ? header.offsetHeight : 0,
                quickAddVisible: quickAddBtn ? window.getComputedStyle(quickAddBtn).display !== 'none' : false,
                searchVisible: searchBar ? window.getComputedStyle(searchBar).display !== 'none' : false,
                notifVisible: notifBtn ? window.getComputedStyle(notifBtn).display !== 'none' : false,
                brandVisible: brand ? window.getComputedStyle(brand).display !== 'none' : false,
            };
        }''')
        results["header_audit"] = header_info

        # Helper to audit overflow & touch targets on current view
        def audit_current_view(view_name):
            data = page.evaluate('''() => {
                const docWidth = document.documentElement.clientWidth;
                const overflows = [];
                const smallTouchTargets = [];

                // Check all elements for overflow
                document.querySelectorAll('*').forEach(el => {
                    const r = el.getBoundingClientRect();
                    if (r.right > docWidth + 1.5 && r.width > 0 && r.height > 0) {
                        overflows.push({
                            tag: el.tagName,
                            id: el.id,
                            className: (el.className || '').toString().slice(0, 40),
                            width: Math.round(r.width),
                            right: Math.round(r.right),
                            docWidth: docWidth
                        });
                    }
                });

                // Check interactive buttons/links for touch targets < 40px
                document.querySelectorAll('button, a, input, select, [role="button"], .task-checkbox').forEach(el => {
                    const style = window.getComputedStyle(el);
                    if (style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0') {
                        const r = el.getBoundingClientRect();
                        if (r.width > 0 && r.height > 0 && (r.width < 38 || r.height < 38)) {
                            // Check if inside header or specific compact group
                            smallTouchTargets.push({
                                tag: el.tagName,
                                id: el.id,
                                text: (el.innerText || el.getAttribute('aria-label') || el.title || '').slice(0, 25).trim(),
                                className: (el.className || '').toString().slice(0, 35),
                                width: Math.round(r.width),
                                height: Math.round(r.height)
                            });
                        }
                    }
                });

                return {
                    overflowCount: overflows.length,
                    overflows: overflows.slice(0, 8),
                    smallTargetsCount: smallTouchTargets.length,
                    smallTargets: smallTouchTargets.slice(0, 10),
                    totalElements: document.querySelectorAll('*').length
                };
            }''')
            return data

        # 2. Test Dashboard View
        page.screenshot(path='scratch/mobile_iphone_dashboard.png', full_page=True)
        results["views"]["dashboard"] = audit_current_view("dashboard")

        # Test Dashboard task completion checkbox
        first_checkbox = page.locator('.task-checkbox').first
        if first_checkbox.count() > 0:
            first_checkbox.click()
            page.wait_for_timeout(300)

        # 3. Test Calendar View
        page.locator(".mobile-nav-item[data-view='calendar']").click()
        page.wait_for_timeout(400)
        page.screenshot(path='scratch/mobile_iphone_calendar.png', full_page=True)
        results["views"]["calendar"] = audit_current_view("calendar")

        # 4. Test History View
        page.locator(".mobile-nav-item[data-view='history']").click()
        page.wait_for_timeout(400)
        page.screenshot(path='scratch/mobile_iphone_history.png', full_page=True)
        results["views"]["history"] = audit_current_view("history")

        # 5. Test Notes View
        page.evaluate("window.navigateView('notes')")
        page.wait_for_timeout(400)
        page.screenshot(path='scratch/mobile_iphone_notes.png', full_page=True)
        results["views"]["notes"] = audit_current_view("notes")

        # 6. Test Analytics View
        page.locator(".mobile-nav-item[data-view='analytics']").click()
        page.wait_for_timeout(400)
        page.screenshot(path='scratch/mobile_iphone_analytics.png', full_page=True)
        results["views"]["analytics"] = audit_current_view("analytics")

        # 7. Test Reminder Notifications Dropdown
        page.locator('#notificationBellBtn').click()
        page.wait_for_timeout(400)
        page.screenshot(path='scratch/mobile_iphone_notifications.png')
        notif_audit = page.evaluate('''() => {
            const dropdown = document.querySelector('#notificationDropdown');
            const rect = dropdown ? dropdown.getBoundingClientRect() : null;
            return {
                open: dropdown ? dropdown.classList.contains('active') : false,
                width: rect ? rect.width : 0,
                height: rect ? rect.height : 0,
                left: rect ? rect.left : 0,
                right: rect ? rect.right : 0
            };
        }''')
        results["notification_dropdown"] = notif_audit
        page.locator('#notificationBellBtn').click()
        page.wait_for_timeout(200)

        # 8. Test Modal Creation View
        page.locator('#mobileFab').click()
        page.wait_for_timeout(400)
        page.screenshot(path='scratch/mobile_iphone_modal.png')
        modal_audit = page.evaluate('''() => {
            const modal = document.querySelector('.modal-sheet');
            const rect = modal ? modal.getBoundingClientRect() : null;
            return {
                active: document.querySelector('#addModalOverlay').classList.contains('active'),
                width: rect ? rect.width : 0,
                height: rect ? rect.height : 0,
                top: rect ? rect.top : 0,
                bottom: rect ? rect.bottom : 0,
                scrollable: modal ? modal.scrollHeight > modal.clientHeight : false
            };
        }''')
        results["modal"] = modal_audit
        page.locator('#closeModalBtn').click()
        page.wait_for_timeout(200)

        results["console_errors"] = errors
        with open('scratch/mobile_audit_results.json', 'w') as f:
            json.dump(results, f, indent=2)

        print("Mobile Audit Complete. JSON dumped.")
        browser.close()

if __name__ == '__main__':
    run_mobile_audit()
