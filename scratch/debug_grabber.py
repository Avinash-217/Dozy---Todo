import asyncio
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page(viewport={'width': 375, 'height': 667})
        await page.goto('http://localhost:3000/', wait_until='domcontentloaded')
        await page.wait_for_selector('#todayTaskList')
        
        # Click mobile FAB to open modal
        fab = page.locator('#mobileFab')
        print("FAB visible:", await fab.is_visible())
        await fab.click()
        await page.wait_for_timeout(500)
        
        modal = page.locator('#addModalOverlay')
        print("Modal visible:", await modal.is_visible())
        print("Modal class:", await modal.get_attribute('class'))
        
        grabber = page.locator('.modal-sheet-grabber')
        count = await grabber.count()
        print("Grabber count:", count)
        if count > 0:
            box = await grabber.bounding_box()
            print("Bounding box:", box)
            disp = await grabber.evaluate("el => window.getComputedStyle(el).display")
            print("Computed display:", disp)
            vis = await grabber.is_visible()
            print("is_visible:", vis)
        else:
            inner = await page.locator('#addModalContent').inner_html()
            print("Inner HTML:", inner[:200])
            
        await browser.close()

if __name__ == '__main__':
    asyncio.run(main())
