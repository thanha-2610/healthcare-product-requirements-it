
import { Suspense } from 'react'
import type { Metadata } from 'next'
import SearchComp from '@/components/pages/search-comp'
import MainLayout from '@/components/main-layout'

export const metadata: Metadata = {
  title: 'Search Products - THANHA.CARE',
  description: 'Search for healthcare products tailored to your needs',
}

const SearchPage = ( ) => {
  return (
    <MainLayout >
      <Suspense fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-zinc-950">
          <div className="text-center space-y-4">
            <div className="w-12 h-12 border-4 border-cyan-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-gray-500 dark:text-gray-400 font-medium">Loading search experience...</p>
          </div>
        </div>
      }>
        <SearchComp/>
      </Suspense>
    </MainLayout>
  )
}
export default SearchPage