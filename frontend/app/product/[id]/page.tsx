
import type { Metadata } from 'next' 
import MainLayout from '@/components/main-layout'
import ProductDetailComp from '@/components/pages/product-detail-comp'

export const metadata: Metadata = {
  title: 'Tìm kiếm Sản Phẩm - TN.Care',
  description: 'Tìm kiếm sản phẩm chăm sóc sức khỏe phù hợp với nhu cầu của bạn',
}

const ProductDetailPage = ( ) => {
  return (
    <MainLayout >
      <ProductDetailComp />
    </MainLayout>
  )
}
export default ProductDetailPage