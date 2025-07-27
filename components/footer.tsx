export function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">XPawto Store</h3>
            <p className="text-sm text-muted-foreground">
              Premium pets for Grow a Garden Roblox game. Fast delivery and trusted service.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Contact</h3>
            <p className="text-sm text-muted-foreground">WhatsApp: 0851-2804-8534</p>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Payment Methods</h3>
            <div className="text-sm text-muted-foreground space-y-1">
              <p>• Dana</p>
              <p>• Gopay</p>
              <p>• Shopee Pay</p>
              <p>• Sea Bank</p>
              <p>• QRIS</p>
            </div>
          </div>
        </div>

        <div className="border-t mt-8 pt-8 text-center">
          <p className="text-sm text-muted-foreground">© 2024 XPawto Store. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
