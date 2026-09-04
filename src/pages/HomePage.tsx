import { useState } from 'react'
import NavBar from '../components/NavBar'
import HeroSection from '../components/HeroSection'
import IntroSection from '../components/IntroSection'
import Location1Section from '../components/Location1Section'
import CliffSection from '../components/CliffSection'
import QualitiesSection from '../components/QualitiesSection'
import AboveSection from '../components/AboveSection'
import CapacitySection from '../components/CapacitySection'
import PresenceSection from '../components/PresenceSection'
import Location2Section from '../components/Location2Section'
import Location3Section from '../components/Location3Section'
import ResidenceSection from '../components/ResidenceSection'
import AdvantagesSection from '../components/AdvantagesSection'
import BookingPopup from '../components/BookingPopup'

export default function HomePage() {
  const [bookingOpen, setBookingOpen] = useState(false)

  return (
    <>
      <NavBar onBookNow={() => setBookingOpen(true)} />
      <main>
        <HeroSection />
        <IntroSection />
        <Location1Section onBookNow={() => setBookingOpen(true)} />
        <CliffSection />
        <QualitiesSection />
        <AboveSection />
        <CapacitySection />
        <PresenceSection onBookNow={() => setBookingOpen(true)} />
        <Location2Section onBookNow={() => setBookingOpen(true)} />
        <Location3Section onBookNow={() => setBookingOpen(true)} />
        <ResidenceSection />
        <AdvantagesSection />
      </main>
      <BookingPopup open={bookingOpen} onClose={() => setBookingOpen(false)} />
    </>
  )
}
