
import type { Metadata } from 'next'
import SearchComp from '@/components/pages/search-comp'
import MainLayout from '@/components/main-layout'

export const metadata: Metadata = {
  title: 'Tìm kiếm Sản Phẩm - TN.Care',
  description: 'Tìm kiếm sản phẩm chăm sóc sức khỏe phù hợp với nhu cầu của bạn',
}

const SearchPage = ( ) => {
  return (
    <MainLayout >
      <SearchComp/>
    </MainLayout>
  )
}
export default SearchPage