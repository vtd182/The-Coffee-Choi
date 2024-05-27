import React from 'react'
import BlogList from './BlogList'
import blogs from '../../../mocks/Blog/coffeeholic'

const BlogHome = () => {
  return (
    <div className="bg-orange-50 px-5">
        <div className='w-full text-center py-8 font-bold text-2xl'>Có thể bạn quan tâm</div>
        <BlogList title="Tin tức" blogs={blogs} />
    </div>
  )
}

export default BlogHome