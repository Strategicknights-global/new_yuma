import React, { useRef, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, Navigation, EffectFade } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import "swiper/css/effect-fade";
import img0 from "../../assets/image0.png";
import img1 from "../../assets/image1.png";
import img2 from "../../assets/image2.png";
/* {import video2 from "../../assets/video2.mp4";} */
import imagemob1 from "../../assets/imagemob1.png";
import imagemob2 from "../../assets/imagemob2.png";
import imagemob3 from "../../assets/imagemob3.png"
const HeroBanner = () => {
  const swiperRef = useRef(null);
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current) {
      const handleEnded = () => {
        if (swiperRef.current) {
          swiperRef.current.slideNext();
        }
      };
      videoRef.current.addEventListener("ended", handleEnded);

      return () => {
        videoRef.current?.removeEventListener("ended", handleEnded);
      };
    }
  }, []);

  return (
    <section className="relative w-full h-[660px] sm:h-[660px] md:h-[90vh] lg:h-[100vh] xl:h-[100vh] bg-black overflow-hidden">
      <Swiper
        modules={[Autoplay, Pagination, Navigation, EffectFade]}
        onSwiper={(swiper) => (swiperRef.current = swiper)}
        autoplay={{ delay: 4000, disableOnInteraction: false }}
        loop
        pagination={{ clickable: true }}
        navigation
        effect="fade"
        speed={1000}
        className="w-full h-[660px] md:h-full object-cover"
      >
        {/* Video slide */}
        {/* <SwiperSlide>
          <video
            ref={videoRef}
            src={video2}
            autoPlay
            muted
            playsInline
            loop
            className="w-full h-full object-cover"
            onPlay={() => {
              if (swiperRef.current) swiperRef.current.autoplay.stop();
            }}
            onEnded={() => {
              if (swiperRef.current) {
                swiperRef.current.autoplay.start();
                swiperRef.current.slideNext();
              }
            }}
          />
        </SwiperSlide> */}
        <style>
          {`
  .swiper-button-next,
  .swiper-button-prev {
    color: #57ba40 !important;
  }

  .swiper-pagination-bullet {
    background: #d1d1d1 !important;
    opacity: 1 !important;
  }

  .swiper-pagination-bullet-active {
    background: #57ba40 !important;
  }
`}
        </style>

        <SwiperSlide>
          <img
            src={imagemob1}
            alt="Mobile Banner"
            className="block md:hidden w-full h-[660px]"
          />
          <img
            src={img0}
            alt="Banner 0"
            className="w-full h-full object-cover"
          />
        </SwiperSlide>
        <SwiperSlide>
          <img
            src={imagemob2}
            alt="Mobile Banner"
            className="block md:hidden w-full h-[660px]"
          />
          <img
            src={img1}
            alt="Banner 1"
            className=" h-[660px] w-full lg:h-full object-cover"
          />
        </SwiperSlide>
        <SwiperSlide>
             <img
            src={imagemob3}
            alt="Mobile Banner"
            className="block md:hidden w-full h-[660px]"
          />
          <img
            src={img2}
            alt="Banner 2"
            className="w-full h-full object-cover"
          />
        </SwiperSlide>
      </Swiper>
    </section>
  );
};

export default HeroBanner;
