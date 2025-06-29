'use client';
import { useState } from 'react';

// Цвета и базовые стили
const COLORS = {
  primary: "#F8B500",
  primaryDark: "#E6A200",
  white: "#fff",
  inputBg: "#f9f9fb",
  inputBorder: "#ebecef",
  buttonText: "#fff",
  buttonFrom: "#fde09b",
  buttonTo: "#f8b500",
  shadow: "rgba(68,70,90,0.09)",
  subtle: "#434D5A"
};

export default function PrintForm() {
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    material: '',
    ownMaterial: false,
    cutRequired: false,
    volume: '',
    designRequired: false,
  });

  const [submitted, setSubmitted] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, type, checked, value } = e.target;
    setForm((f) => ({
      ...f,
      [name]: type === 'checkbox' ? checked : value
    }));
  }

async function handleSubmit(e: React.FormEvent) {
  e.preventDefault();

  const payload = {
    company_name: form.name,
    phone: form.phone,
    email: form.email,
    material: form.material,
    material_ownership: form.ownMaterial,
    cutting_required: form.cutRequired,
    quantity: form.volume,
    design_required: form.designRequired,
  };

  try {
    const res = await fetch('http://localhost:8000/submit-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!res.ok) throw new Error('Ошибка отправки');
    setSubmitted(true);
  } catch (e) {
    alert('Ошибка при отправке заявки!');
  }
}

  function handlePhoneChange(e: React.ChangeEvent<HTMLInputElement>) {
    let numbers = e.target.value.replace(/\D/g, '');
    if (numbers.startsWith("8")) numbers = "7" + numbers.substring(1);
    if (!numbers.startsWith("7")) numbers = "7" + numbers;
    numbers = numbers.slice(0, 11);
    let phone = "+7";
    if (numbers.length > 1) phone += "-" + numbers.slice(1, 4);
    if (numbers.length > 4) phone += "-" + numbers.slice(4, 7);
    if (numbers.length > 7) phone += "-" + numbers.slice(7, 9);
    if (numbers.length > 9) phone += "-" + numbers.slice(9, 11);
    setForm(f => ({ ...f, phone }));
  }

  if (submitted) return (
    <div style={{
      maxWi: '25%',
      margin: "40px auto",
      background: COLORS.white,
      borderRadius: 30,
      boxShadow: `0 6px 38px 0 ${COLORS.shadow}`,
      padding: "48px 32px",
      textAlign: "center"
    }}>
      <h2 style={{margin: '18px 0 10px', fontWeight: 700}}>Спасибо!</h2>
      <div style={{color: COLORS.subtle}}>Ваша заявка отправлена. Мы свяжемся с вами в ближайшее время.</div>
    </div>
  );

  return (
    <div style={{
      maxWidth: '100%',
      margin: "50px auto",
      background: COLORS.white,
      borderRadius: 34,
      boxShadow: `0 8px 40px 0 ${COLORS.shadow}`,
      padding: "48px 38px 34px 38px",
      fontFamily: "Manrope, Arial, sans-serif",
      minWidth: 0
    }}>
      <form onSubmit={handleSubmit} style={{ width: '100%' }}>

        <h1 style={{
          textAlign: "center",
          margin: "22px 0 7px 0",
          fontSize: 27,
          fontWeight: 700,
          letterSpacing: 0.02,
          color: "#222"
        }}>Заявка на печать</h1>

        <p style={{
          textAlign: "center",
          color: COLORS.subtle,
          margin: "0 0 24px 0",
          fontWeight: 500
        }}>
          Получите быстрый расчет стоимости — оставьте контактные данные!
        </p>

        <FieldLabel>Компания / Имя Фамилия
          <FormInput
            name="name"
            value={form.name}
            onChange={handleChange}
            autoComplete="off"
            placeholder=""
            required
          />
        </FieldLabel>

        <FieldLabel>Телефон
          <FormInput
            name="phone"
            value={form.phone}
            onChange={handlePhoneChange}
            autoComplete="off"
            required
          />
        </FieldLabel>

        <FieldLabel>Email
          <FormInput
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            autoComplete="off"
            required
          />
        </FieldLabel>

        <FieldLabel>Материал для печати
          <FormSelect
            name="material"
            value={form.material}
            onChange={handleChange}
            required
          >
            <option value="" disabled>Выберите…</option>
            <option value="Фанера">Фанера</option>
            <option value="Стекло">Стекло</option>
          </FormSelect>
        </FieldLabel>

        <div style={{ display: "flex", gap: 16, margin: "10px 0 0 0" }}>
          <CheckboxLabel>
            <input
              name="ownMaterial"
              type="checkbox"
              checked={form.ownMaterial}
              onChange={handleChange}
              style={checkboxStyle}
            />
            <span>Предоставлю свой материал</span>
          </CheckboxLabel>
          <CheckboxLabel>
            <input
              name="cutRequired"
              type="checkbox"
              checked={form.cutRequired}
              onChange={handleChange}
              style={checkboxStyle}
            />
            <span>Требуется раскрой</span>
          </CheckboxLabel>
        </div>

        <FieldLabel style={{ marginTop: 12 }}>Тираж (шт. или м²)
          <FormInput
            name="volume"
            value={form.volume}
            onChange={handleChange}
            autoComplete="off"
            required
          />
        </FieldLabel>

        <div style={{ margin: "6px 0 18px 1px" }}>
          <CheckboxLabel>
            <input
              name="designRequired"
              type="checkbox"
              checked={form.designRequired}
              onChange={handleChange}
              style={checkboxStyle}
            />
            <span>Требуются услуги дизайна</span>
          </CheckboxLabel>
        </div>

        <button type="submit" style={buttonStyle}>Отправить заявку</button>
      </form>
    </div>
  );
}

function Logo() {
  return (
    <div style={{
      width: 54,
      height: 54,
      background: "linear-gradient(135deg,#fde09b 0%,#f8b500 100%)",
      margin: "0 auto",
      borderRadius: "50%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    }}>
      <span style={{
        fontWeight: 800,
        fontSize: 30,
        color: "#fff",
        fontFamily: "inherit",
        textShadow: "0 2px 10px #fff5"
      }}>S</span>
    </div>
  );
}

function FieldLabel({ children, style }: any) {
  return <label style={{
    display: "block",
    marginBottom: 17,
    color: "#232323",
    fontWeight: 500,
    fontSize: 16,

  }}>{children}</label>
}

function FormInput(props: any) {
  return <input {...props} style={{
    width: "100%",
    fontSize: 17,
    marginTop: 8,
    marginBottom: 2,
    padding: "15px 14px",
    borderRadius: 10,
    border: `1.5px solid ${COLORS.inputBorder}`,
    background: COLORS.inputBg,
    transition: "border-color .18s",
    outline: "none",
    fontWeight: 500,
    color: "#232323"
  }}
    onFocus={e => e.currentTarget.style.borderColor = COLORS.primary}
    onBlur={e => e.currentTarget.style.borderColor = COLORS.inputBorder}
  />
}

function FormSelect(props: any) {
  return <select {...props} style={{
    width: "100%",
    fontSize: 17,
    marginTop: 8,
    marginBottom: 2,
    padding: "15px 14px",
    borderRadius: 10,
    border: `1.5px solid ${COLORS.inputBorder}`,
    background: COLORS.inputBg,
    color: "#232323",
    transition: "border-color .18s",
    fontWeight: 500,
    outline: "none"
  }}
    onFocus={e => e.currentTarget.style.borderColor = COLORS.primary}
    onBlur={e => e.currentTarget.style.borderColor = COLORS.inputBorder}
  />;
}

const CheckboxLabel = (props: any) => (
  <label style={{
    display: "flex",
    alignItems: "center",
    gap: 7,
    color: "#413a23",
    fontSize: 15,
    fontWeight: 500
  }}>{props.children}</label>
);

const checkboxStyle = {
  accentColor: COLORS.primary,
  width: 19,
  height: 19,
  borderRadius: 6,
  marginRight: 4,
  marginTop: 1
} as React.CSSProperties;

const buttonStyle = {
  display: 'block',
  width: "100%",
  marginTop: 18,
  fontWeight: 700,
  fontSize: 19,
  padding: "15px 0",
  borderRadius: 13,
  letterSpacing: 0.03,
  background: `linear-gradient(90deg, #fde09b, #f8b500 90%)`,
  color: "#fff",
  border: "none",
  cursor: "pointer",
  boxShadow: "0 2px 8px #fde3a645",
  transition: "opacity .18s"
};
