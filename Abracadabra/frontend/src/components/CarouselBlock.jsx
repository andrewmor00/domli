import { useState } from 'react';
import bgCarousel from '../assets/bgCarousel.png';
import groupCards1 from '../assets/groupCards1.png';
import groupCards2 from '../assets/groupCards2.png';

const slides = [
  {
    title: 'Получайте умные рекомендации от',
    accent: 'Домли',
    subtitle: 'на основе вашего поиска и интересующих категорий',
    button: 'Войти',
    img: groupCards1,
  },
  {
    title: 'Узнавайте о новых объявлениях через телеграм',
    accent: '',
    subtitle: 'Подключите бесплатные оповещения от нашего телеграм-бота и получайте лучшие варианты предложений от собственников',
    button: 'Подписаться',
    img: groupCards2,
  },
];

export default function CarouselBlock() {
  const [active, setActive] = useState(0);
  const [animating, setAnimating] = useState(false);
  const [direction, setDirection] = useState('right');

  const handlePrev = () => {
    setDirection('left');
    setAnimating(true);
    setTimeout(() => {
      setActive((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
      setAnimating(false);
    }, 300);
  };
  const handleNext = () => {
    setDirection('right');
    setAnimating(true);
    setTimeout(() => {
      setActive((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
      setAnimating(false);
    }, 300);
  };

  const slide = slides[active];

  return (
    <section
      className="carousel-block"
      style={{
        backgroundImage: `url(${bgCarousel})`,
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
      }}
    >
      <button className="carousel-arrow left" onClick={handlePrev} aria-label="Назад">&#60;</button>
      <div className="carousel-content">
        <div className={`carousel-slide${animating ? ` animating ${direction}` : ''}`}>
          <div className="carousel-text">
            <div className="carousel-title-row">
              <span className="carousel-title-main">{slide.title} </span>
              {slide.accent && <span className="carousel-title-accent">{slide.accent}</span>}
            </div>
            <div className="carousel-subtitle">{slide.subtitle}</div>
            <button className="carousel-btn">{slide.button}</button>
          </div>
          <div className="carousel-img-wrap">
            <img src={slide.img} alt="Карточки" className="carousel-img" />
          </div>
        </div>
      </div>
      <button className="carousel-arrow right" onClick={handleNext} aria-label="Вперёд">&#62;</button>
      <div className="carousel-dots">
        {slides.map((_, i) => (
          <span key={i} className={i === active ? 'dot active' : 'dot'} />
        ))}
      </div>
    </section>
  );
} 