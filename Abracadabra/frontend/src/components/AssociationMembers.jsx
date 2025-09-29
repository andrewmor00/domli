const members = [
  {
    name: 'ССК',
    url: 'https://erzrf.ru/zastroyschiki/brand/gruppa-kompanij-ssk-5360409001?organizationId=5360409001&region=vse-regiony&regionKey=0&costType=1',
  },
  {
    name: 'AVA GROUP',
    url: 'https://erzrf.ru/zastroyschiki/brand/ava-group-5369340001?organizationId=5369340001&region=vse-regiony&regionKey=0&costType=1',
  },
  {
    name: 'Инсити Девелопмент',
    url: 'https://erzrf.ru/zastroyschiki/brand/gruppa-kompanij-insiti-5696575001?organizationId=5696575001&region=vse-regiony&regionKey=0&costType=1',
  },
  {
    name: 'ТОЧНО',
    url: 'https://erzrf.ru/zastroyschiki/brand/gruppa-kompanij-tochno-2894925001?organizationId=2894925001&region=vse-regiony&regionKey=0&costType=1',
  },

  {
    name: 'DOGMA',
    url: 'https://erzrf.ru/zastroyschiki/brand/dogma-5699998001?organizationId=5699998001&region=vse-regiony&regionKey=0&costType=1',
  },
  {
    name: 'ПОБЕДА',
    url: 'https://erzrf.ru/zastroyschiki/brand/gruppa-kompanij-pobeda-5694337001?organizationId=5694337001&region=vse-regiony&regionKey=0&costType=1',
  },
  {
    name: 'ДЕСО',
    url: 'https://erzrf.ru/zastroyschiki/brand/gruppa-kompanij-metropolis-7611848001?organizationId=7611848001&region=vse-regiony&regionKey=0&costType=1',
  },
  {
    name: 'НЕОМЕТРИЯ',
    url: 'https://erzrf.ru/zastroyschiki/brand/neometrija-1734816001?organizationId=1734816001&region=vse-regiony&regionKey=0&costType=1',
  },
  {
    name: 'АФК',
    url: 'https://erzrf.ru/zastroyschiki/brand/gruppa-kompanij-afk-18554659001?organizationId=18554659001&region=vse-regiony&regionKey=0&costType=1',
  },
  {
    name: 'ДЕВЕЛОПМЕНТ ЮГ',
    url: 'https://erzrf.ru/zastroyschiki/brand/stroitelno-investicionnaja-korporacija-development-jug-1459022001?organizationId=1459022001&region=vse-regiony&regionKey=0&costType=1',
  },
  {
    name: 'ART GROUP',
    url: 'https://erzrf.ru/zastroyschiki/brand/gruppa-kompanij-art-grupp-5728155001?organizationId=5728155001&region=vse-regiony&regionKey=0&costType=1',
  },
  {
    name: 'ЕВРОПЕЯ',
    url: 'https://erzrf.ru/zastroyschiki/brand/gruppa-kompanij-evropeja-1708756001?organizationId=1708756001&region=vse-regiony&regionKey=0&costType=1',
  },
  {
    name: 'ЛЕНДЕКС',
    url: 'https://erzrf.ru/zastroyschiki/brand/gruppa-kompanij-lendeks-24528790001?organizationId=24528790001&region=vse-regiony&regionKey=0&costType=1',
  },
  {
    name: 'БЭЛ Девелопмент',
    url: 'https://erzrf.ru/zastroyschiki/brand/bel-development-4368787001?organizationId=4368787001&region=vse-regiony&regionKey=0&costType=1',
  },
  {
    name: 'LIVINGSTON',
    url: 'https://erzrf.ru/zastroyschiki/ooo-specializirovannyj-zastrojshhik-gostinichnyj-kompleks-sochiojlstroj-23210710001?region=Krasnodarskiy-kray&regionKey=143001001&costType=1&sortType=qrooms&organizationId=23210710001',
  }
];

export default function AssociationMembers() {
  return (
    <section className="px-8 py-8">
      <h2 className="text-2xl font-bold mb-4">Участники Ассоциации</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {members.map((member, i) => (
          <a
            key={i}
            href={member.url}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white rounded-lg shadow flex items-center justify-center h-20 hover:shadow-lg transition-shadow duration-200 p-2"
          >
          {member.name}
          </a>
        ))}
      </div>
    </section>
  );
} 