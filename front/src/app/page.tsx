"use client";
import { useState } from "react";

// Цвета и базовые стили
const COLORS = {
  primary: "#ffd057",        // Новый основной цвет для акцентов и кнопки!
  primaryDark: "#ca9700",
  white: "#fff",
  inputBg: "#f9f9fb",
  inputBorder: "#ebecef",
  placeholder: "#b2b2b2",    // Цвет серого плейсхолдера
  buttonText: "#fff",
  shadow: "rgba(68,70,90,0.09)",
  subtle: "#434D5A",
};

const FORM_FONT = '"Manrope", Arial, sans-serif';

const GUTTER = 20; // отступ между любыми элементами формы в px

const MATERIALS = [
  { value: "ПВХ", label: "ПВХ", thickness: ["1", "2", "3", "4", "5", "6", "8", "10"] },
  { value: "Акрил прозрачный", label: "Акрил прозрачный", thickness: ["2", "3", "4", "5", "6", "8", "10"] },
  { value: "Акрил молочный", label: "Акрил молочный", thickness: ["2", "3", "4", "5", "6", "8", "10"] },
  { value: "АКП", label: "АКП", thickness: ["3"] },
  { value: "Фанера", label: "Фанера", thickness:
    ["3","4","5","6","8","9","10","12","15","18","20","21","24","27"] },
  { value: "Пленка белая (Orajet)", label: "Пленка белая (Orajet)", thickness: [] },
  { value: "Пленка прозрачная (Orajet)", label: "Пленка прозрачная (Orajet)", thickness: [] },
  { value: "Пленка цветная (Orajet)", label: "Пленка цветная (Orajet)", thickness: [] },
  { value: "Поликарбонат монолитный", label: "Поликарбонат монолитный", thickness: ["1","1.5","2","3","4","5","6","8","10"] },
  { value: "ПЭТ", label: "ПЭТ", thickness: ["0.3","0.5","0.7","1","1.5","2","3"] },
  { value: "МДФ", label: "МДФ", thickness: ["6","8","10","12","14","16","18","19","22","25","28"] },
  { value: "Пенокартон", label: "Пенокартон", thickness: ["3","5","10"] },
  { value: "Стекло", label: "Стекло", thickness: ["4","5","6","8","10"] },
];


export default function PrintForm() {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    material: "",
    thickness: "",
    ownMaterial: false,
    cutRequired: false,
    volume: "",
    designRequired: false,
    consent: false,
    comment: "",
    fileUrl: "",
  });

  const [submitted, setSubmitted] = useState(false);
  const [fileUploading, setFileUploading] = useState(false);
  const [fileError, setFileError] = useState("");
  const [showConsentError, setShowConsentError] = useState(false);

  function handleChange(e) {
    const { name, type, checked, value } = e.target;
    setForm((f) => ({
      ...f,
      [name]: type === "checkbox" ? checked : value,
      ...(name === "material" ? { thickness: "" } : {})
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault()

    if (!form.consent) {
      setShowConsentError(true);
      setTimeout(() => setShowConsentError(false), 2500);
      return;
    }
    const payload = {
      company_name: form.name,
      phone: form.phone,
      email: form.email,
      material: form.material,
      thickness: form.thickness,
      material_ownership: form.ownMaterial,
      cutting_required: form.cutRequired,
      quantity: form.volume,
      design_required: form.designRequired,
      comment: form.comment,
      file_url: form.fileUrl,
    };
    try {
      const res = await fetch("http://localhost:8000/submit-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Ошибка отправки");
      setSubmitted(true);
    } catch (e) {
      alert(`Ошибка при отправке заявки! ${e}`);
    }
  }

  async function handleFileChange(e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    const MAX_SIZE = 10 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      setFileError("Файл слишком большой. Максимальный размер — 10 МБ.");
      // При необходимости сбросьте выбранный файл
      e.target.value = "";
      return;
    }

    setFileError("");
    setFileUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("http://localhost:8000/upload", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error("Ошибка загрузки файла");
      const data = await res.json();
      if (!data.url) throw new Error("Сервер не вернул ссылку на файл");
      setForm((f) => ({ ...f, fileUrl: data.url }));
    } catch (err) {
      setFileError("Не удалось загрузить файл. Попробуйте еще раз.");
    } finally {
      setFileUploading(false);
    }
  }


  function handlePhoneChange(e) {
    let numbers = e.target.value.replace(/\D/g, "");
    if (numbers.startsWith("8")) numbers = "7" + numbers.substring(1);
    if (!numbers.startsWith("7")) numbers = "7" + numbers;
    numbers = numbers.slice(0, 11);
    let phone = "+7";
    if (numbers.length > 1) phone += "-" + numbers.slice(1, 4);
    if (numbers.length > 4) phone += "-" + numbers.slice(4, 7);
    if (numbers.length > 7) phone += "-" + numbers.slice(7, 9);
    if (numbers.length > 9) phone += "-" + numbers.slice(9, 11);
    setForm((f) => ({ ...f, phone }));
  }

  const selectedMaterial = MATERIALS.find((m) => m.value === form.material);
  const thicknessOptions = selectedMaterial?.thickness || [];

  if (submitted)
    return (
      <div
        style={{
          maxWi: "25%",
          margin: "40px auto",
          background: COLORS.white,
          borderRadius: 30,
          boxShadow: `0 6px 38px 0 ${COLORS.shadow}`,
          padding: "48px 32px",
          textAlign: "center",
        }}
      >
        <h2 style={{ margin: "18px 0 10px", fontWeight: 700 }}>Спасибо!</h2>
        <div style={{ color: COLORS.subtle }}>
          Ваша заявка отправлена. Мы свяжемся с вами в ближайшее время.
        </div>
      </div>
    );

  return (
    <div
      style={{
        maxWidth: "700px",
        margin: "50px auto",
        background: COLORS.white,
        borderRadius: 34,
        boxShadow: `0 8px 40px 0 ${COLORS.shadow}`,
        padding: "48px 38px 34px 38px",
        fontFamily: "Manrope, Arial, sans-serif",
        minWidth: 0,
      }}
    >
      <form onSubmit={handleSubmit} style={{ width: "100%" }}>

        <h1
          style={{
            textAlign: "center",
            margin: `0 0 ${GUTTER}px 0`,
            fontSize: 27,
            fontWeight: 700,
            letterSpacing: 0.02,
            color: "#222",
          }}
        >
          Заявка на печать
        </h1>

        <p
          style={{
            textAlign: "center",
            color: COLORS.subtle,
            margin: `0 0 ${GUTTER}px 0`,
            fontWeight: 500,
          }}
        >
          Получите быстрый расчет стоимости!
        </p>

        <FormInput
          name="name"
          value={form.name}
          onChange={handleChange}
          autoComplete="off"
          placeholder="Компания / Имя Фамилия"
          required
        />

        <FormInput
          name="phone"
          value={form.phone}
          onChange={handlePhoneChange}
          autoComplete="off"
          placeholder="Телефон"
          required
        />

        <FormInput
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          autoComplete="off"
          placeholder="Email"
          required
        />

        <FormSelect
          name="material"
          value={form.material}
          onChange={handleChange}
          required
          placeholder="Материал для печати"
        >
          <option value="" disabled>Материал для печати</option>
          {MATERIALS.map((m) => (
            <option key={m.value} value={m.value}>{m.label}</option>
          ))}
        </FormSelect>

        {/* Выпадающий список толщин для выбранного материала */}
        {thicknessOptions.length > 0 && (
          <FormSelect
            name="thickness"
            value={form.thickness}
            onChange={handleChange}
            required
            placeholder="Толщина, мм"
          >
            <option value="" disabled>Толщина, мм</option>
            {thicknessOptions.map((val) => (
              <option key={val} value={val}>
                {val}
              </option>
            ))}
          </FormSelect>
        )}

        {/* --- Чекбоксы --- */}
        <div
          style={{
            display: "flex",
            gap: GUTTER,
            marginBottom: GUTTER,
            marginTop: 0,
          }}
        >
          <PrettyCheckbox
            name="ownMaterial"
            checked={form.ownMaterial}
            onChange={handleChange}
            label="Предоставлю свой материал"
          />
          <PrettyCheckbox
            name="cutRequired"
            checked={form.cutRequired}
            onChange={handleChange}
            label="Требуется раскрой"
          />
        </div>

        <FormInput
          name="volume"
          value={form.volume}
          onChange={handleChange}
          autoComplete="off"
          placeholder="Тираж (шт. или м²)"
          required
        />

        <PrettyCheckbox
          name="designRequired"
          checked={form.designRequired}
          onChange={handleChange}
          label="Требуются услуги дизайна"
        />

        <FormTextArea
          name="comment"
          value={form.comment}
          onChange={handleChange}
          placeholder="Комментарий (дополнительные пожелания или детали задания)"
          rows={3}
        />

        {/* Файл */}
        <div style={{ marginBottom: GUTTER }}>
          <FileUpload
            onChange={handleFileChange}
            disabled={fileUploading}
            fileUrl={form.fileUrl}
            fileError={fileError}
          />
        </div>

        {/* --- Чекбокс согласия --- */}
        <div style={{marginBottom: 30, position: "relative"}}>
          <PrettyCheckbox
            name="consent"
            checked={form.consent}
            onChange={handleChange}
            label={
              <>
                Я даю согласие на обработку персональных данных и&nbsp;
                <a
                  href="https://www.sun-premium.com/privacy-policy/"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    color: COLORS.primaryDark,
                    textDecoration: "underline",
                  }}
                >
                  соглашаюсь с Политикой Конфиденциальности
                </a>
              </>
            }
          />
          {showConsentError && <ConsentBubbleError />}
        </div>
        {showConsentError && <ConsentBubbleError />}


        <button
          type="submit"
          style={buttonStyle}
        >
          Отправить заявку
        </button>
      </form>
      <style jsx global>{`
        body, input, textarea, select, button {
          font-family: 'Montserrat', 'Manrope', Arial, sans-serif !important;
          font-weight: 500;
        }
        input::placeholder, textarea::placeholder {
          color: #b2b2b2;
          font-family: 'Montserrat', 'Manrope', Arial, sans-serif;
          font-size: 17px;
          opacity: 1;
        }
        select:invalid {
          color: #b2b2b2 !important;
          font-family: 'Montserrat', 'Manrope', Arial, sans-serif;
          font-size: 17px;
          opacity: 1;
        }
      `}</style>

    </div>
  );
}

// ---------- Кастомные компоненты ------------

function FormInput(props) {
  return (
    <input
      {...props}
      style={{
        width: "100%",
        fontSize: 17,
        marginBottom: GUTTER,
        padding: "15px 14px",
        borderRadius: 10,
        border: `1.5px solid ${COLORS.inputBorder}`,
        background: COLORS.inputBg,
        transition: "border-color .18s",
        outline: "none",
        fontWeight: 500,
        color: "#232323",
        boxSizing: "border-box",
        '::placeholder': { color: COLORS.placeholder },
      }}
      placeholder={props.placeholder}
      onFocus={e => (e.currentTarget.style.borderColor = COLORS.primary)}
      onBlur={e => (e.currentTarget.style.borderColor = COLORS.inputBorder)}
    />
  );
}

function FormSelect({ children, ...props }) {
  return (
    <select
      {...props}
      style={{
        width: "100%",
        fontSize: 17,
        marginBottom: GUTTER,
        padding: "15px 14px",
        borderRadius: 10,
        border: `1.5px solid ${COLORS.inputBorder}`,
        background: COLORS.inputBg,
        color: props.value ? "#232323" : COLORS.placeholder,
        transition: "border-color .18s",
        fontWeight: 500,
        outline: "none",
        appearance: "none",
        boxSizing: "border-box",
      }}
      onFocus={e => (e.currentTarget.style.borderColor = COLORS.primary)}
      onBlur={e => (e.currentTarget.style.borderColor = COLORS.inputBorder)}
    >
      {children}
    </select>
  );
}

function FormTextArea(props) {
  return (
    <textarea
      {...props}
      style={{
        width: "100%",
        marginBottom: 20, // или ваш GUTTER
        padding: "14px 14px",
        borderRadius: 10,
        border: `1.5px solid #ebecef`,
        background: "#f9f9fb",
        resize: "vertical",
        minHeight: 70,
        fontWeight: 500,
        fontSize: 16,
        color: "#232323",
        boxSizing: "border-box",
        outline: "none", // убираем outline
        WebkitAppearance: "none", // убираем фокус обводку в хроме/сафари
        appearance: "none",       // на всякий случай для других браузеров
        transition: "border-color .18s",
      }}
      onFocus={e => (e.currentTarget.style.borderColor = "#ffd057")}
      onBlur={e => (e.currentTarget.style.borderColor = "#ebecef")}
      placeholder={props.placeholder}
    />
  );
}

function FileUpload({ onChange, disabled, fileUrl, fileError }) {
  return (
    <div style={{ marginBottom: GUTTER }}>
      <label style={{
        fontSize: 16,
        color: "#232323",
        fontWeight: 500,
        marginBottom: 8,
        marginRight: 20
      }}>
        Прикрепить файл:
      </label>
      <label
        style={{
          display: "inline-block",
          padding: "10px 20px",
          background: COLORS.primary,
          color: "#fff",
          borderRadius: "9px",
          cursor: disabled ? "not-allowed" : "pointer",
          fontWeight: 600,
          fontSize: 15,
          boxShadow: "0 2px 8px #fde3a645"
        }}
      >
        {disabled ? "Загрузка..." : "Выбрать файл"}
        <input
          type="file"
          onChange={onChange}
          disabled={disabled}
          style={{
            display: "none"
          }}
        />
      </label>
      {(fileUrl || fileError) && (
        <div style={{ marginTop: 8 }}>
          {fileUrl && (
            <span>
              <a
                href={fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  color: COLORS.primaryDark,
                  textDecoration: "underline",
                  fontWeight: 500,
                  borderRadius: 3,
                  padding: "1px 6px",
                }}>
                файл прикреплён
              </a>
            </span>
          )}
          {fileError && (
            <div style={{ color: "red", fontSize: 14, marginTop: 3 }}>{fileError}</div>
          )}
        </div>
      )}
    </div>
  );
}



// --- Кастомный чекбокс ---
function PrettyCheckbox({ name, checked, onChange, label, required }) {
  return (
    <label style={{
      display: 'flex',
      alignItems: 'center',
      marginBottom: GUTTER,
      cursor: 'pointer',
      fontWeight: 500,
      gap: 10,
      fontSize: 15,
      userSelect: 'none'
    }}>
      <span style={{ position: 'relative', width: 22, height: 22, display: 'inline-block' }}>
        <input
          type="checkbox"
          name={name}
          checked={checked}
          onChange={onChange}
          required={required}
          style={{
            opacity: 0,
            width: 22,
            height: 22,
            position: "absolute",
            left: 0,
            top: 0,
            margin: 0,
            zIndex: 2,
            cursor: "pointer"
          }}
        />
        <span style={{
          display: 'inline-block',
          width: 22,
          height: 22,
          background: "#fff",
          border: `2px solid ${COLORS.primary}`,
          borderRadius: 6,
          boxSizing: "border-box",
          verticalAlign: "middle",
          position: "absolute",
          left: 0, top: 0,
          transition: "border-color .18s"
        }}>
          {checked && (
            <svg width="22" height="22" style={{display:'block', position:'absolute', top:0, left:0}} viewBox="0 0 22 22">
              <polyline
                points="5,7.5 8,16 14,0"
                style={{
                  fill: "none",
                  stroke: COLORS.primary,
                  strokeWidth: 2.5,
                  strokeLinecap: "round",
                  strokeLinejoin: "round"
                }}
              />
            </svg>
          )}
        </span>
      </span>
      <span style={{ color: "#413a23", fontWeight: 500, marginLeft: 10 }}>
        {label}
      </span>
    </label>
    
  );
}

function ConsentBubbleError() {
  return (
    <div style={{
      position: 'absolute',
      left: '50%',
      transform: 'translateX(-50%)',
      top: '-55px',
      background: '#fff',
      border: '2px solid #ffd057',
      boxShadow: '0 2px 8px #0002',
      borderRadius: 8,
      padding: '13px 20px 13px 16px',
      color: '#444',
      fontWeight: 500,
      fontSize: 16,
      zIndex: 99,
      display: 'flex',
      alignItems: 'center',
      minWidth: 230,
      transition: 'opacity .2s',
      animation: 'fadein .15s'
    }}>
      <span style={{
        display:'inline-flex',
        alignItems:'center',
        justifyContent:'center',
        background:'#ffd057',
        color:'#fff',
        minWidth:28,
        minHeight:28,
        borderRadius:6,
        fontWeight:700,
        fontSize:18,
        marginRight:15,
        boxShadow: '0 1px 5px #ffd05733'
      }}>!</span>
      Необходимо принять политику.

    </div>
  );
}


const buttonStyle = {
  display: "block",
  width: "100%",
  marginTop: GUTTER,
  fontWeight: 700,
  fontSize: 19,
  padding: "15px 0",
  borderRadius: 13,
  letterSpacing: 0.03,
  background: COLORS.primary, // только цвет, без градиента!
  color: "#fff",
  border: "none",
  cursor: "pointer",
  boxShadow: "0 2px 8px #fde3a645",
  transition: "background .18s, opacity .18s",
};
