import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay, Pagination } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/pagination'
import { Link } from 'react-router-dom'
import { optimizeImage } from '../utils/cloudinary'

export default function BannerSlider({ banners = [] }) {
  if (!banners.length) return null

  return (
    <div className="rounded-xl overflow-hidden" style={{ boxShadow: '0 4px 16px rgba(0,0,0,0.12)' }}>
      <Swiper
        modules={[Autoplay, Pagination]}
        autoplay={{ delay: 4000, disableOnInteraction: false }}
        pagination={{ clickable: true }}
        loop={banners.length > 1}
        className="w-full"
      >
        {banners.map(b => (
          <SwiperSlide key={b._id}>
            {b.link ? (
              <Link to={b.link}>
                <img src={optimizeImage(b.imageUrl, 'banner')} alt={b.title || 'Banner'}
                  className="w-full h-44 md:h-56 object-cover" />
              </Link>
            ) : (
              <img src={optimizeImage(b.imageUrl, 'banner')} alt={b.title || 'Banner'}
                className="w-full h-44 md:h-56 object-cover" />
            )}
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  )
}
