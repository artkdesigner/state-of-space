import NavBar from '../components/NavBar'
import HeroSection from '../components/HeroSection'
import IntroSection from '../components/IntroSection'
import Location1Section from '../components/Location1Section'

export default function HomePage() {
  return (
    <>
      <NavBar />
      <main>
        <HeroSection />
        <IntroSection />
        <Location1Section />
      </main>
    </>
  )
}
