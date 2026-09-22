from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={'width': 375, 'height': 667})
    page.goto('http://localhost:3000/')
    page.wait_for_selector('#todayTaskList')
    
    fab = page.locator('#mobileFab')
    print("Mobile FAB visible:", fab.is_visible())
    fab.click()
    page.wait_for_timeout(500)
    
    modal = page.locator('#addModalOverlay')
    print("Modal visible:", modal.is_visible())
    print("Modal class:", modal.get_attribute('class'))
    
    grabber = page.locator('.modal-sheet-grabber')
    print("Grabber count:", grabber.count())
    if grabber.count() > 0:
        box = grabber.bounding_box()
        print("Grabber bounding box:", box)
        style = page.evaluate("el => window.getComputedStyle(el).display", grabber.element_handle())
        print("Grabber computed display:", style)
        print("Grabber is_visible:", grabber.is_visible())
    else:
        print("No grabber element found in DOM!")
        content = page.locator('#addModalContent').inner_html()
        print("addModalContent innerHTML starts with:", content[:150])
    browser.close()
