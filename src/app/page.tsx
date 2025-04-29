import Hero from './components/Hero';
import Features from './components/Features';
import FeaturedCategories from './components/FeaturedCategories';
import FeaturedProducts from './components/FeaturedProducts';
import AboutBanner from './components/AboutBanner';
import Testimonials from './components/Testimonials';
import Newsletter from './components/Newsletter';

export default function Home() {
  return (
    <>
      <Hero />
      <FeaturedCategories />
      <Features />
      <FeaturedProducts />
      <AboutBanner />
      <Testimonials />
      <Newsletter />
    </>
  );
}
