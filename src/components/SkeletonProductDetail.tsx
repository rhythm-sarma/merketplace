export default function SkeletonProductDetail() {
  return (
    <div className="product-detail">
      <div className="product-detail-inner">
        <div className="product-detail-image skeleton" style={{ minHeight: '500px', borderRadius: '8px' }}></div>
        <div className="product-detail-info" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="skeleton" style={{ height: '16px', width: '40%', borderRadius: '4px' }}></div>
          <div className="skeleton" style={{ height: '48px', width: '80%', borderRadius: '6px' }}></div>
          <div className="skeleton" style={{ height: '24px', width: '30%', borderRadius: '4px' }}></div>
          <div className="skeleton" style={{ height: '32px', width: '100px', borderRadius: '16px', marginTop: '8px' }}></div>
          
          <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div className="skeleton" style={{ height: '16px', width: '100%', borderRadius: '4px' }}></div>
            <div className="skeleton" style={{ height: '16px', width: '100%', borderRadius: '4px' }}></div>
            <div className="skeleton" style={{ height: '16px', width: '80%', borderRadius: '4px' }}></div>
            <div className="skeleton" style={{ height: '16px', width: '90%', borderRadius: '4px' }}></div>
          </div>
          
          <div style={{ marginTop: '24px' }}>
            <div className="skeleton" style={{ height: '60px', width: '100%', borderRadius: '8px' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
}
