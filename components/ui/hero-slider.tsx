'use client';

import Image from 'next/image';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay, EffectFade } from 'swiper/modules';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/effect-fade';
import Link from 'next/link';

interface HeroContent {
  _id: string;
  title: string;
  image: string;
  order: number;
  isActive: boolean;
}

interface HeroSliderProps {
  heroes: HeroContent[];
}

export default function HeroSlider({ heroes }: HeroSliderProps) {
  if (!heroes.length) {
    return null;
  }

  return (
    <section className="relative w-full">
      <Swiper
        modules={[Navigation, Pagination, Autoplay, EffectFade]}
        spaceBetween={20}
        slidesPerView={1}
        breakpoints={{
          640: { slidesPerView: 2 },
          1024: { slidesPerView: 2 }
        }}
        // navigation
        pagination={{ clickable: true }}
        autoplay={{
          delay: 5000,
          disableOnInteraction: false,
        }}
        loop={true}
        className="py-8"
      >
        {heroes.map((hero) => (
          <SwiperSlide key={hero._id}>
            <Link href={hero.buttonLink}>
            <div className="relative aspect-[16/6] overflow-hidden rounded-lg shadow-lg cursor-pointer">
              <Image
                src={hero.image}
                alt={hero.title}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              />
              {/* Hover effect overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300" />
            </div>
            </Link>
          </SwiperSlide>
        ))}
      </Swiper>

      <style jsx global>{`
        .swiper {
          padding: 2rem 1rem;
          max-width: 1400px;
          margin: 0 auto;
        }
        
        .swiper-button-next,
        .swiper-button-prev {
          color: white;
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(4px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          width: 40px;
          height: 40px;
          border-radius: 50%;
        }

        .swiper-button-next:after,
        .swiper-button-prev:after {
          font-size: 1.2rem;
        }

        .swiper-button-next:hover,
        .swiper-button-prev:hover {
          background: rgba(255, 255, 255, 0.2);
        }

        .swiper-pagination-bullet {
          background: rgba(0, 0, 0, 0.5);
        }

        .swiper-pagination-bullet-active {
          background: #000;
          width: 20px;
          border-radius: 4px;
        }
      `}</style>
    </section>
  );
}
