from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page()
    page.on("console", lambda msg: print("PAGE LOG:", msg.text))
    page.goto("http://localhost:3000/", wait_until="domcontentloaded")
    
    # Check if headerQuickAddBtn element exists
    btn_exists = page.evaluate("!!document.getElementById('headerQuickAddBtn')")
    print("headerQuickAddBtn exists in DOM:", btn_exists)
    
    # Check calling window.openAddModal directly
    page.evaluate("window.openAddModal('Task')")
    page.wait_for_timeout(300)
    print("Overlay class after direct call:", page.locator("#addModalOverlay").get_attribute("class"))
    print("modalTitle count after direct call:", page.locator("#modalTitle").count())
    
    # Now close it
    page.evaluate("window.closeAddModal()")
    page.wait_for_timeout(300)
    print("Overlay class after close:", page.locator("#addModalOverlay").get_attribute("class"))
    
    # Now try dispatching click event via JS
    page.evaluate("document.getElementById('headerQuickAddBtn').click()")
    page.wait_for_timeout(300)
    print("Overlay class after dispatch click:", page.locator("#addModalOverlay").get_attribute("class"))
    
    browser.close()
