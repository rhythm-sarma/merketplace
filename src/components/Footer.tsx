import Link from "next/link";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-grid">
          <div className="footer-brand">
            <img src="/images/logo.svg" alt="racksup" className="footer-logo-img" />
            <p>
              Your one stop destination for thrift and preloved clothing. Curated
              fashion, sustainable choices, unbeatable prices.
            </p>
          </div>
          <div className="footer-col">
            <h4>Shop</h4>
            <ul>
              <li>
                <Link href="/shop?category=men">Mens</Link>
              </li>
              <li>
                <Link href="/shop?category=women">Womens</Link>
              </li>
              <li>
                <Link href="/shop">Featured</Link>
              </li>
              <li>
                <Link href="/shop">All Products</Link>
              </li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Company</h4>
            <ul>
              <li>
                <Link href="/blog">Blog</Link>
              </li>
              <li>
                <Link href="/contact">Contact</Link>
              </li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Support</h4>
            <ul>
              <li>
                <Link href="/faq">FAQ</Link>
              </li>
              <li>
                <Link href="/vendor">Sell With Us</Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2026 racksup. All rights reserved.</p>
          <div className="footer-socials">
            <a href="#">Instagram</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
