import React from 'react';
import { useApp } from '../context/AppContext';
import {
  ShieldCheck,
  FileText,
  CreditCard,
  Info,
  ArrowLeft,
  Building2,
  Lock,
  Phone,
  Mail,
  MessageCircle,
  AlertTriangle,
  Scale
} from 'lucide-react';

interface LegalPagesProps {
  pageType: 'privacy' | 'terms' | 'payment-rules' | 'about';
}

export const LegalPages: React.FC<LegalPagesProps> = ({ pageType }) => {
  const { language, t, navigate } = useApp();
  const isKy = language === 'ky';

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/90 shadow-sm space-y-8">
        
        {/* Navigation back */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <button
            onClick={() => navigate('home')}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{t.btnBack}</span>
          </button>
          <div className="text-[11px] text-slate-400 font-mono">
            {isKy ? 'Редакция: Сентябрь 2026' : 'Редакция: Сентябрь 2026'} | v1.0-2026
          </div>
        </div>

        {/* 1. TERMS & PUBLIC OFFER */}
        {pageType === 'terms' && (
          <div className="space-y-6 text-slate-700 leading-relaxed text-xs sm:text-sm">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                  {isKy ? 'Билим берүү кызматтарын көрсөтүүнүн Публичная офертасы' : 'Публичная оферта на оказание образовательных услуг'}
                </h1>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  {isKy ? '«ОРТ ОНЛАЙН KG» платформасын колдонуу келишими' : 'Договор использования платформы «ОРТ ОНЛАЙН KG»'}
                </p>
              </div>
            </div>

            {/* Requisites highlight */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-1.5">
              <div className="font-bold text-slate-900 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-blue-600" />
                <span>{isKy ? 'Аткаруучу жана расмий төлөм алуучу:' : 'Исполнитель и получатель платежей:'}</span>
                <span className="text-blue-700">ОсОО «Билет Центр»</span>
              </div>
              <p className="text-slate-600 text-[11px]">
                {isKy
                  ? 'Бренд жана онлайн платформа: «ОРТ ОНЛАЙН KG». Кызматтын түрү: Жалпы республикалык тестирлөөгө (ОРТ) аралыктан онлайн даярдоо.'
                  : 'Бренд и онлайн-платформа: «ОРТ ОНЛАЙН KG». Вид деятельности: дистанционная подготовка к Общереспубликанскому тестированию (ОРТ).'}
              </p>
            </div>

            {/* Clause 1: General provisions & Offer Acceptance */}
            <section className="space-y-2">
              <h2 className="text-sm sm:text-base font-bold text-slate-900">
                {isKy ? '1. Жалпы жоболор жана акцепт' : '1. Общие положения и акцепт оферты'}
              </h2>
              <p>
                {isKy
                  ? '1.1. Бул документ Кыргыз Республикасынын Жарандык кодексинин 398-беренесине ылайык коомдук сунуш (публичная оферта) болуп саналат. Колдонуучунун сайтта катталуусу, төлөмдү жүргүзүүсү же жеке кабинетке кирүүсү бул офертаны толук жана эч кандай эскертүүсүз кабыл алгандыгын (акцепт) билдирет.'
                  : '1.1. Настоящий документ в соответствии со ст. 398 Гражданского кодекса Кыргызской Республики является публичной офертой. Регистрация на сайте, оплата тарифа или вход в кабинет подтверждают полный и безоговорочный акцепт условий настоящего Договора.'}
              </p>
              <p>
                {isKy
                  ? '1.2. Электрондук акцепт юридикалык жактан кагаз жүзүндө кол коюлган келишимге теңештирилет жана система тарабынан колдонуучунун ID, телефон номери, датасы жана IP-дареги менен катталат.'
                  : '1.2. Электронный акцепт имеет силу письменного договора и регистрируется в системе с фиксацией ID пользователя, номера телефона, времени акцепта и технического IP.'}
              </p>
            </section>

            {/* Clause 2: Subject of services & course duration */}
            <section className="space-y-2">
              <h2 className="text-sm sm:text-base font-bold text-slate-900">
                {isKy ? '2. Кызматтардын предмети жана тарифтик пландар' : '2. Предмет договора и тарифные планы'}
              </h2>
              <p>
                {isKy
                  ? '2.1. Аткаруучу Тапшырыкчыга (окуучуга же анын мыйзамдуу өкүлүнө) төмөнкү эки негизги программа боюнча ОРТга даярдануу мүмкүнчүлүгүн берет:'
                  : '2.1. Исполнитель предоставляет Заказчику доступ к образовательному онлайн-курсу подготовки к ОРТ по двум основным программам:'}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-200">
                  <span className="font-bold text-blue-900 block">STANDARD (1 айлык модуль)</span>
                  <span className="text-xs text-slate-600 block mt-1">
                    {isKy
                      ? 'Базалык баа: 2 000 сом/ай. Промокод менен: 1 000 сом/ай. Көлөмү: айына 24–30 академиялык саат. Модулдар кадам сайын ачылат.'
                      : 'Базовая цена: 2 000 сом/мес. По промокоду: 1 000 сом/мес. Объем: 24–30 часов. Модули открываются строго последовательно.'}
                  </span>
                </div>
                <div className="p-3 bg-amber-50/50 rounded-xl border border-amber-200">
                  <span className="font-bold text-amber-900 block">PREMIUM (Толук 8 айлык курс)</span>
                  <span className="text-xs text-slate-600 block mt-1">
                    {isKy
                      ? 'Базалык баа: 16 000 сом. 70% эксклюзив арзандатуу менен: 4 800 сом толук 8 ай үчүн. Бардык модулдар камтылган, кошумча төлөм жок.'
                      : 'Базовая цена: 16 000 сом. Со скидкой 70% по промокоду: 4 800 сом за 8 месяцев. Все 8 модулей без доплат.'}
                  </span>
                </div>
              </div>
            </section>

            {/* Clause 3: Pedagogical sequential unlocking */}
            <section className="space-y-2">
              <h2 className="text-sm sm:text-base font-bold text-slate-900">
                {isKy ? '3. Модулдардын жана сабактардын ачылуу тартиби' : '3. Порядок последовательного открытия модулей'}
              </h2>
              <p>
                {isKy
                  ? '3.1. Педагогикалык методиканы сактоо максатында, 1-ай толук бүтмөйүнчө 2-ай ачылбайт; 2-ай бүтмөйүнчө 3-ай ачылбайт жана ушул сыяктуу 8-айга чейин уланат.'
                  : '3.1. В целях соблюдения педагогической последовательности доступ к следующему модулю (месяцу) открывается только после успешного завершения предыдущего.'}
              </p>
              <p>
                {isKy
                  ? '3.2. Ай аяктады деп эсептелиши үчүн: милдеттүү теория жана видео сабактар көрүлүшү, практикалык тапшырмалар аткарылышы жана айдын финалдык тести тапшырылышы зарыл.'
                  : '3.2. Для завершения модуля необходимо изучить обязательные видеоматериалы, пройти практические тесты и сдать контрольный экзамен месяца.'}
              </p>
              <p>
                {isKy
                  ? '3.3. Premium тарифтин колдонуучуларына бардык 8 ай төлөнгөн, бирок ошол эле ырааттуу окуу тартиби сакталат.'
                  : '3.3. Для тарифа Premium доступ ко всем 8 месяцам оплачен полностью, при этом поэтапная педагогическая последовательность сохраняется.'}
              </p>
            </section>

            {/* Clause 4: Payment, MBANK QR and Anti-Fraud */}
            <section className="space-y-2">
              <h2 className="text-sm sm:text-base font-bold text-slate-900">
                {isKy ? '4. Төлөм тартиби жана квитанцияларды текшерүү' : '4. Оплата, проверка квитанций и защита от дубликатов'}
              </h2>
              <p>
                {isKy
                  ? '4.1. Төлөм MBANK / MBusiness QR-коду, улуттук QR же банк карталары аркылуу ОсОО «Билет Центр» эсебине жүргүзүлөт.'
                  : '4.1. Оплата производится через MBANK / MBusiness QR, единый национальный QR или банковские карты на реквизиты ОсОО «Билет Центр».'}
              </p>
              <p>
                {isKy
                  ? '4.2. Төлөмдөн кийин колдонуучу «Мен төлөдүм» баскычын басып, система тарабынан берилген уникалдуу Payment ID (мисалы, ORT-2026-000001) номерин, төлөөчүнүн атын, телефонун жана банктык чектин скриншотун жүктөйт.'
                  : '4.2. После перевода пользователь нажимает «Мен төлөдүм» и загружает скриншот чека с указанием уникального номера заказа.'}
              </p>
              <p>
                {isKy
                  ? '4.3. Бир эле чекти же транзакция номерин бир нече аккаунтка колдонууга катуу тыюу салынат. Мындай аракеттер алдамчылык катары бааланып, аккаунт автоматтык түрдө бөгөттөлөт.'
                  : '4.3. Повторное использование одного и того же чека на разных аккаунтах запрещено и пресекается антифрод-системой.'}
              </p>
            </section>

            {/* Clause 5: Account sharing and copyright */}
            <section className="space-y-2">
              <h2 className="text-sm sm:text-base font-bold text-slate-900">
                {isKy ? '5. Автордук укуктар жана аккаунтту башкаларга берүүгө тыюу салуу' : '5. Защита авторских прав и запрет передачи аккаунта'}
              </h2>
              <p>
                {isKy
                  ? '5.1. Платформадагы бардык тесттер, түшүндүрмөлөр, видеолор жана окуу материалдары ОсОО «Билет Центр» компаниясынын интеллектуалдык менчиги болуп саналат.'
                  : '5.1. Все учебные материалы, тесты, алгоритмы и видеолекции являются интеллектуальной собственностью ОсОО «Билет Центр».'}
              </p>
              <p>
                {isKy
                  ? '5.2. Аккаунтту үчүнчү жактарга берүүгө, материалдарды көчүрүп сатууга же таркатууга тыюу салынат. Бир аккаунт бир гана окуучуга таандык.'
                  : '5.2. Передача учетной записи третьим лицам или копирование материалов курса запрещены. Одна учетная запись предназначена строго для одного учащегося.'}
              </p>
            </section>

            {/* Clause 6: Refunds and Disputes */}
            <section className="space-y-2">
              <h2 className="text-sm sm:text-base font-bold text-slate-900">
                {isKy ? '6. Акча каражаттарын кайтаруу жана талаштарды чечүү' : '6. Возврат средств и порядок разрешения споров'}
              </h2>
              <p>
                {isKy
                  ? '6.1. Эгер төлөм жүргүзүлгөндөн кийин 3 календардык күндүн ичинде окуучу платформанын кызматынан баш тартууну кааласа, колдоо кызматына кайрылуу менен каражат 100% кайтарылып берилет.'
                  : '6.1. В течение 3 календарных дней с момента первой оплаты Заказчик имеет право запросить возврат 100% средств при обращении в службу поддержки.'}
              </p>
              <p>
                {isKy
                  ? '6.2. Бардык талаштар алгач сүйлөшүүлөр жана кардарларды колдоо кызматы аркылуу чечилет. Келишимге жетишилбесе, Кыргыз Республикасынын мыйзамдарына ылайык Бишкек шаарынын сотунда каралат.'
                  : '6.2. Все претензии рассматриваются в досудебном порядке через поддержку. При недостижении согласия спор передается в суд по месту нахождения Исполнителя (г. Бишкек).'}
              </p>
            </section>

            {/* Clause 7: Official Support Contacts */}
            <section className="space-y-2 p-4 bg-slate-50 rounded-2xl border border-slate-200">
              <h2 className="text-sm sm:text-base font-bold text-slate-900">
                {isKy ? '7. Расмий байланыш каналдары' : '7. Официальные контакты'}
              </h2>
              <ul className="text-xs space-y-1.5 text-slate-600">
                <li><strong>{isKy ? 'Аткаруучу:' : 'Исполнитель:'}</strong> ОсОО «Билет Центр»</li>
                <li><strong>{isKy ? 'Бренд:' : 'Бренд:'}</strong> ОРТ ОНЛАЙН KG</li>
                <li><strong>Instagram:</strong> @ort_online_kg (https://instagram.com/ort_online_kg)</li>
                <li><strong>{isKy ? 'Негизги WhatsApp:' : 'Основной WhatsApp:'}</strong> +996 779 949 400</li>
                <li><strong>{isKy ? 'Кардарларды колдоо (Тел/WA):' : 'Поддержка клиентов (Тел/WA):'}</strong> +996 507 392 634</li>
                <li><strong>{isKy ? 'Администратор:' : 'Администратор:'}</strong> kelsinay22@gmail.com</li>
                <li><strong>{isKy ? 'Админге билдирүүлөр:' : 'Уведомления администратору:'}</strong> +7 964 700 49 70</li>
              </ul>
            </section>
          </div>
        )}

        {/* 2. PRIVACY POLICY */}
        {pageType === 'privacy' && (
          <div className="space-y-6 text-slate-700 leading-relaxed text-xs sm:text-sm">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                  {isKy ? 'Купуялуулук саясаты жана жеке маалыматтарды иштетүү' : 'Политика конфиденциальности и обработка персональных данных'}
                </h1>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  {isKy ? '«ОРТ ОНЛАЙН KG» платформасында колдонуучулардын укуктарын коргоо' : 'Защита данных пользователей на платформе «ОРТ ОНЛАЙН KG»'}
                </p>
              </div>
            </div>

            <section className="space-y-2">
              <h2 className="text-sm sm:text-base font-bold text-slate-900">
                {isKy ? '1. Жалпы жоболор' : '1. Общие положения'}
              </h2>
              <p>
                {isKy
                  ? 'Бул Саясат «ОРТ ОНЛАЙН KG» веб-платформасынын жана ОсОО «Билет Центр» компаниясынын колдонуучулардын жеке маалыматтарын Кыргыз Республикасынын «Жеке мүнөздөгү маалымат жөнүндө» Мыйзамына ылайык чогултуу, сактоо жана коргоо тартибин аныктайт.'
                  : 'Настоящая Политика определяет порядок обработки персональных данных пользователей веб-платформы «ОРТ ОНЛАЙН KG» со стороны ОсОО «Билет Центр» в строгом соответствии с Законом Кыргызской Республики «Об информации персонального характера».'}
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-sm sm:text-base font-bold text-slate-900">
                {isKy ? '2. Кайсы маалыматтар чогултулат' : '2. Перечень собираемых данных'}
              </h2>
              <ul className="list-disc pl-5 space-y-1">
                <li>{isKy ? 'Колдонуучунун аты-жөнү (ФИО);' : 'ФИО пользователя;'}</li>
                <li>{isKy ? 'Телефон номери жана электрондук почтасы;' : 'Номер телефона и адрес электронной почты;'}</li>
                <li>{isKy ? 'Окуу классы, окутуу тили (кыргызча же орусча);' : 'Язык обучения и класс;'}</li>
                <li>{isKy ? 'Диагностикалык жана сынак тесттеринин жыйынтыктары;' : 'Результаты тестов и учебный прогресс;'}</li>
                <li>{isKy ? 'Төлөм маалыматтары (чектердин реквизиттери жана статусу, банк картасынын жашыруун CVV коду бизде сакталбайт).' : 'Данные платежей (квитанции и статус, CVV коды не сохраняются).'}</li>
              </ul>
            </section>

            <section className="space-y-2">
              <h2 className="text-sm sm:text-base font-bold text-slate-900">
                {isKy ? '3. Маалыматты сактоо жана коопсуздук' : '3. Хранение и безопасность данных'}
              </h2>
              <p>
                {isKy
                  ? 'Колдонуучунун маалыматтары шифрленген каналдар аркылуу берилет жана үчүнчү жактарга коммерциялык максатта эч качан сатылбайт же берилбейт.'
                  : 'Данные передаются по защищенным протоколам (SSL/TLS) и никогда не передаются сторонним организациям в рекламных целях.'}
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-sm sm:text-base font-bold text-slate-900">
                {isKy ? '4. Жашы жете электердин укуктары' : '4. Права несовершеннолетних пользователей'}
              </h2>
              <p>
                {isKy
                  ? 'Окуучулардын басымдуу бөлүгү мектеп бүтүрүүчүлөрү (16–18 жаш) болгондуктан, катталуу учурунда ата-эненин макулдугу жана Ата-эне кабинети аркылуу көзөмөлдөө мүмкүнчүлүгү каралган.'
                  : 'Поскольку большинство пользователей — старшеклассники, предусмотрена возможность родительского согласия и контроля успеваемости через Родительский кабинет.'}
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-sm sm:text-base font-bold text-slate-900">
                {isKy ? '5. Байланыш' : '5. Вопросы и обращения по персональным данным'}
              </h2>
              <p>
                {isKy
                  ? 'Маалыматты өчүрүү же тактоо боюнча суроолор боюнча: kelsinay22@gmail.com же WhatsApp: +996 507 392 634 аркылуу кайрылсаңыз болот.'
                  : 'По вопросам уточнения или удаления персональных данных обращайтесь на email: kelsinay22@gmail.com или в WhatsApp: +996 507 392 634.'}
              </p>
            </section>
          </div>
        )}

        {/* 3. PAYMENT RULES */}
        {pageType === 'payment-rules' && (
          <div className="space-y-6 text-slate-700 leading-relaxed text-xs sm:text-sm">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <CreditCard className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                  {isKy ? 'Төлөм жүргүзүү жана эсептешүү эрежелери' : 'Правила оплаты и порядок расчетов'}
                </h1>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  {isKy ? 'MBANK, QR жана банктык карталар менен иштөө тартиби' : 'Порядок расчетов через MBANK, QR и банковские карты'}
                </p>
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-1">
              <span className="font-bold text-slate-900 block">{isKy ? 'Расмий алуучу:' : 'Официальный получатель:'} ОсОО «Билет Центр»</span>
              <span className="text-slate-600 block">{isKy ? 'Кызмат жана бренд:' : 'Сервис и бренд:'} ОРТ ОНЛАЙН KG</span>
              <span className="text-slate-600 block">{isKy ? 'Валюта:' : 'Валюта расчетов:'} Кыргыз сому (KGS)</span>
            </div>

            <section className="space-y-2">
              <h2 className="text-sm sm:text-base font-bold text-slate-900">
                {isKy ? 'Төлөм ыкмалары жана комиссиялар' : 'Способы оплаты и комиссии'}
              </h2>
              <ul className="space-y-2">
                <li className="p-3 bg-white border border-slate-200 rounded-xl">
                  <strong>MBANK / MBusiness QR:</strong> {isKy ? 'Комиссия 0%. Төлөм заматта катталат.' : 'Комиссия 0%. Моментальное зачисление.'}
                </li>
                <li className="p-3 bg-white border border-slate-200 rounded-xl">
                  <strong>{isKy ? 'Башка банктардын улуттук QR-коду (Optima24, Bakai, Элкарт ж.б.):' : 'Единый национальный QR других банков:'}</strong> {isKy ? 'Комиссия 1% банктын тарифине жараша.' : 'Комиссия 1% по тарифу банка-отправителя.'}
                </li>
                <li className="p-3 bg-white border border-slate-200 rounded-xl">
                  <strong>{isKy ? 'Банк карталары (Visa, Mastercard, Элкарт):' : 'Банковские карты (Visa, Mastercard, Элкарт):'}</strong> {isKy ? 'Коопсуз төлөм шлюзу аркылуу кабыл алынат.' : 'Безопасный процессинг через защищенный шлюз.'}
                </li>
              </ul>
            </section>

            <section className="space-y-2">
              <h2 className="text-sm sm:text-base font-bold text-slate-900">
                {isKy ? 'Төлөмдү текшерүү жана активдештирүү мөөнөтү' : 'Сроки проверки и активации'}
              </h2>
              <p>
                {isKy
                  ? '«Мен төлөдүм» баскычы аркылуу чек жүктөлгөндөн кийин, оператор 5–15 мүнөттүн ичинде төлөмдү банктык көчүрмө менен салыштырып, подписканы ачат.'
                  : 'После загрузки чека в форме «Мен төлөдүм» оператор сверяет квитанцию с выпиской в течение 5–15 минут и активирует доступ.'}
              </p>
            </section>
          </div>
        )}

        {/* 4. ABOUT */}
        {pageType === 'about' && (
          <div className="space-y-6 text-slate-700 leading-relaxed text-xs sm:text-sm">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                <Info className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                  {isKy ? '«ОРТ ОНЛАЙН KG» платформасы жөнүндө' : 'О платформе «ОРТ ОНЛАЙН KG»'}
                </h1>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  {isKy ? 'Кыргызстандагы бүтүрүүчүлөр үчүн заманбап билим берүү системасы' : 'Интеллектуальная система подготовки к ОРТ в Кыргызстане'}
                </p>
              </div>
            </div>

            <section className="space-y-3">
              <p>
                {isKy
                  ? '«ОРТ ОНЛАЙН KG» — Кыргызстандын бүтүрүүчүлөрүнө Жалпы республикалык тестирлөөгө (ОРТ) максималдуу упай топтоого жардам берүү максатында иштелип чыккан толук кандуу коммерциялык EdTech платформасы.'
                  : '«ОРТ ОНЛАЙН KG» — современная образовательная EdTech-платформа, созданная для качественной и системной подготовки к Общереспубликанскому тестированию (ОРТ) по всем регионам Кыргызстана.'}
              </p>
              <p>
                {isKy
                  ? 'Биз ЦООМО тарабынан жарыяланган расмий программанын жана мектеп стандартынын негизинде 8 айлык ырааттуу окуу курсун түздүк. Ар бир сабакта теория, видео сабак, практикалык тапшырмалар жана кадам сайын жетектеген жеке онлайн-түшүндүрүүчү иштейт.'
                  : 'Программа построена на официальных материалах ЦООМО и охватывает полный 8-месячный цикл подготовки по математике, аналогиям, пониманию текста, дополнению предложений и грамматике с поддержкой персонального онлайн-репетитора.'}
              </p>
            </section>
          </div>
        )}
      </div>
    </div>
  );
};
