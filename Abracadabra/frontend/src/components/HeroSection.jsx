import React, { useState } from 'react';
import heroImage from '../assets/firstBlockImg.png';

const MODES = [
  { label: 'Купить', value: 'buy' },
  { label: 'Ипотека', value: 'mortgage' },
  { label: 'Рассрочка', value: 'installment' },
];

export default function HeroSection() {
  const [mode, setMode] = useState('buy');

  return (
    <section
      className="hero-section px-4 sm:px-6 lg:px-8"
      style={{ fontFamily: 'Nunito, sans-serif' }}
    >
      {/* Левая часть */}
      <div className="hero-section__left">
        <h1 className="hero-section__title text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl">
          Ищете дом?
        </h1>
        <h2 className="hero-section__subtitle text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl">
          Начните с <span className="hero-section__subtitle--accent">Домли</span>
        </h2>
        <p className="hero-section__desc text-sm sm:text-base md:text-lg lg:text-xl">
          Ваш уютный уголок ближе, чем вы думаете
        </p>
        {/* Фильтры и кнопки */}
        <div className="hero-section__filters">
          <div className="hero-section__switch-group">
            {MODES.map((btn) => (
              <button
                key={btn.value}
                className={`btn-switch${mode === btn.value ? ' btn-switch--active' : ''}`}
                onClick={() => setMode(btn.value)}
                type="button"
              >
                {btn.label}
              </button>
            ))}
          </div>
          <div className="hero-section__select-group">
            <select className="hero-section__select">
              <option>Комнатность</option>
              <option>Студия</option>
              <option>1 комната</option>
              <option>2 комнаты</option>
              <option>3 комнаты</option>
              <option>4+ комнат</option>
            </select>
            <select className="hero-section__select">
              <option>Цена</option>
              <option>до 6 млн ₽</option>
              <option>6-10 млн ₽</option>
              <option>10-17 млн ₽</option>
              <option>17+ млн ₽</option>
            </select>
            <select className="hero-section__select">
              <option>Сроки</option>
              <option>Сдан</option>
              <option>2024</option>
              <option>2025</option>
              <option>2026+</option>
            </select>
            <button className="hero-section__find-btn">Найти</button>
          </div>
        </div>
      </div>
      {/* Правая часть */}
      <div className="hero-section__right">
        <img
          src={heroImage}
          alt="ЖК Домли"
          className="hero-section__img"
        />
      </div>
    </section>
  );
} 