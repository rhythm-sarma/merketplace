export default function SkeletonCard() {
  return (
    <div className="product-card skeleton-card">
      <div className="product-card-image skeleton"></div>
      <div className="product-card-info" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div className="skeleton" style={{ height: '20px', width: '80%', borderRadius: '4px' }}></div>
        <div className="skeleton" style={{ height: '24px', width: '40%', borderRadius: '4px' }}></div>
        <div className="skeleton" style={{ height: '12px', width: '60%', borderRadius: '4px', marginTop: '4px' }}></div>
      </div>
    </div>
  );
}
