// Bitrix24 CRM Integration Service

class BitrixService {
  constructor() {
    // URL портала Битрикс24
    this.portalUrl = "https://b24-bvtv4z.bitrix24.ru";
    // Webhook URL из настроек (НОВЫЙ вебхук)
    this.webhookUrl =
      "https://b24-bvtv4z.bitrix24.ru/rest/1/bal8wrv83oix1jg9/crm.lead.add";
    // URL для создания сделок
    this.dealWebhookUrl =
      "https://b24-bvtv4z.bitrix24.ru/rest/1/bal8wrv83oix1jg9/crm.deal.add";
    // URL для создания контактов
    this.contactWebhookUrl =
      "https://b24-bvtv4z.bitrix24.ru/rest/1/bal8wrv83oix1jg9/crm.contact.add";
  }

  async sendLead(leadData) {
    try {

      // Формируем параметры для GET запроса
      const params = new URLSearchParams({
        "fields[TITLE]": leadData.title,
        "fields[NAME]": leadData.name,
        "fields[PHONE][0][VALUE]": leadData.phone,
        "fields[PHONE][0][VALUE_TYPE]": "WORK",
        "fields[EMAIL][0][VALUE]": leadData.email,
        "fields[EMAIL][0][VALUE_TYPE]": "WORK",
        "fields[COMMENTS]": leadData.comments,
        "fields[SOURCE_ID]": "WEB",
        "fields[SOURCE_DESCRIPTION]": leadData.source || "Сайт недвижимости",
        // Добавляем поля для цены сделки
        "fields[OPPORTUNITY]": leadData.opportunity || 0, // Сумма сделки
        "fields[CURRENCY_ID]": leadData.currency || "RUB", // Валюта
      });

      // Добавляем пользовательские поля если они есть
      if (leadData.propertyId) {
        params.append("fields[UF_CRM_PROPERTY_ID]", leadData.propertyId);
      }
      if (leadData.propertyType) {
        params.append("fields[UF_CRM_PROPERTY_TYPE]", leadData.propertyType);
      }
      if (leadData.propertyArea) {
        params.append("fields[UF_CRM_PROPERTY_AREA]", leadData.propertyArea);
      }
      if (leadData.propertyRooms) {
        params.append("fields[UF_CRM_PROPERTY_ROOMS]", leadData.propertyRooms);
      }

      // Отправляем GET запрос (Битрикс24 REST API поддерживает GET)
      const response = await fetch(`${this.webhookUrl}?${params.toString()}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      return {
        success: true,
        leadId: result.result,
        data: result,
      };
    } catch (error) {
      console.error("❌ Ошибка отправки в Битрикс24:", error);

      return {
        success: false,
        error: error.message,
        details: error,
      };
    }
  }

  // Создание контакта в Битрикс24
  async createContact(contactData) {
    try {
      console.log("📤 Создание контакта в Битрикс24:", contactData);

      const params = new URLSearchParams({
        "fields[NAME]": contactData.name || "Клиент",
        "fields[PHONE][0][VALUE]": contactData.phone,
        "fields[PHONE][0][VALUE_TYPE]": "WORK",
        "fields[EMAIL][0][VALUE]": contactData.email,
        "fields[EMAIL][0][VALUE_TYPE]": "WORK",
        "fields[SOURCE_ID]": "WEB",
        "fields[SOURCE_DESCRIPTION]": "Сайт недвижимости",
      });

      const response = await fetch(`${this.contactWebhookUrl}?${params.toString()}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log("✅ Контакт успешно создан в Битрикс24:", result);

      return {
        success: true,
        contactId: result.result,
        data: result,
      };
    } catch (error) {
      console.error("❌ Ошибка создания контакта в Битрикс24:", error);
      return {
        success: false,
        error: error.message,
        details: error,
      };
    }
  }

  // Создание сделки в Битрикс24 (с автоматическим созданием контакта)
  async sendDeal(dealData) {
    try {
      console.log("📤 Отправка сделки в Битрикс24:", dealData);

      // Сначала создаем контакт
      const contactResult = await this.createContact({
        name: dealData.name,
        phone: dealData.phone,
        email: dealData.email,
      });

      if (!contactResult.success) {
        throw new Error(`Ошибка создания контакта: ${contactResult.error}`);
      }

      // Формируем параметры для создания сделки
      const params = new URLSearchParams({
        "fields[TITLE]": dealData.title,
        "fields[TYPE_ID]": "GOODS", // Тип сделки - продажа товаров
        "fields[STAGE_ID]": "NEW", // Этап сделки - новая
        "fields[OPPORTUNITY]": dealData.opportunity || 0, // Сумма сделки
        "fields[CURRENCY_ID]": dealData.currency || "RUB", // Валюта
        "fields[COMMENTS]": dealData.comments,
        "fields[SOURCE_ID]": "WEB",
        "fields[SOURCE_DESCRIPTION]": dealData.source || "Сайт недвижимости",
        "fields[CONTACT_ID]": contactResult.contactId, // Привязываем созданный контакт
      });

      // Добавляем пользовательские поля
      if (dealData.propertyId) {
        params.append("fields[UF_CRM_PROPERTY_ID]", dealData.propertyId);
      }
      if (dealData.propertyType) {
        params.append("fields[UF_CRM_PROPERTY_TYPE]", dealData.propertyType);
      }
      if (dealData.propertyArea) {
        params.append("fields[UF_CRM_PROPERTY_AREA]", dealData.propertyArea);
      }
      if (dealData.propertyRooms) {
        params.append("fields[UF_CRM_PROPERTY_ROOMS]", dealData.propertyRooms);
      }

      // Отправляем запрос
      const response = await fetch(`${this.dealWebhookUrl}?${params.toString()}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log("✅ Сделка успешно создана в Битрикс24:", result);

      return {
        success: true,
        dealId: result.result,
        contactId: contactResult.contactId,
        data: result,
      };
    } catch (error) {
      console.error("❌ Ошибка создания сделки в Битрикс24:", error);

      return {
        success: false,
        error: error.message,
        details: error,
      };
    }
  }

  // Парсинг цены из строки (например, "5.2 млн ₽" -> 5200000)
  parsePrice(priceInput) {
    try {
      // Проверяем на null, undefined, пустую строку
      if (priceInput === null || priceInput === undefined || priceInput === '') {
        return 0;
      }
      
      // Если уже число, возвращаем его
      if (typeof priceInput === 'number') {
        return Math.round(priceInput);
      }
      
      // Преобразуем в строку, если это не строка
      const priceString = String(priceInput);
      
      // Удаляем все кроме цифр, точек и запятых
      const cleanPrice = priceString.replace(/[^\d.,]/g, '');
      
      if (!cleanPrice) return 0;
      
      // Заменяем запятую на точку для правильного парсинга
      const normalizedPrice = cleanPrice.replace(',', '.');
      const price = parseFloat(normalizedPrice);
      
      if (isNaN(price)) return 0;
      
      // Если в оригинальной строке есть "млн", умножаем на миллион
      if (priceString.toLowerCase().includes('млн')) {
        return Math.round(price * 1000000);
      }
      
      // Если в оригинальной строке есть "тыс", умножаем на тысячу
      if (priceString.toLowerCase().includes('тыс')) {
        return Math.round(price * 1000);
      }
      
      return Math.round(price);
    } catch (error) {
      console.error('Ошибка парсинга цены:', error, 'Входное значение:', priceInput);
      return 0;
    }
  }

  // Форматирование комментария с информацией о недвижимости
  formatComment(formData) {
    let comment = "";

    if (formData.message) {
      comment += `Сообщение клиента: ${formData.message}\n\n`;
    }

    comment += "--- ИНФОРМАЦИЯ ОБ ОБЪЕКТЕ ---\n";
    comment += `Объект: ${formData.propertyName}\n`;
    comment += `Цена: ${formData.propertyPrice}\n`;
    comment += `Застройщик: ${formData.propertyDeveloper}\n`;
    comment += `Проект: ${formData.propertyProject}\n`;
    comment += `Источник: ${formData.source}\n`;
    comment += `Время заявки: ${formData.timestamp}`;

    return comment;
  }
}

export default new BitrixService();
