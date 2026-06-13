
import type { Metadata } from 'next' 
import MainLayout from '@/components/main-layout'
import ProductDetailComp from '@/components/pages/product-detail-comp'

export const metadata: Metadata = {
  title: 'Tìm kiếm Sản Phẩm - THANHA.CARE',
  description: 'Tìm kiếm sản phẩm chăm sóc sức khỏe phù hợp với nhu cầu của bạn',
}

export async function generateStaticParams() {
  // Sinh các param tĩnh từ 1 đến 90 tương ứng với các ID sản phẩm trong CSV
  return Array.from({ length: 90 }, (_, i) => ({
    id: String(i + 1),
  }));
}

const ProductDetailPage = ( ) => {
  return (
    <MainLayout >
      <ProductDetailComp />
    </MainLayout>
  )
}
export default ProductDetailPage