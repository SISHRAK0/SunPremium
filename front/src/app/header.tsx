export function Header() {
  return (
    <header
      style={{
        width: '100%',
        padding: '20px 0',
        background: 'rgba(255, 255, 255, 0)',
        display: 'flex',
        paddingLeft: '5%',
        paddingRight: '5%',
        justifyContent: 'space-between', 
        boxShadow: '0 2px 16px #f6ec8c10',
        backdropFilter: 'blur(1px)',
        minHeight: 70,
      }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 50, minWidth: 0, height: "100%" }}>
        <div style={{
          height: "60px",
          display: "flex",
          alignItems: "center"
        }}>
          <img
            src="/header_logo.svg"
            alt="Sun Premium logo"
            style={{
              height: "100%",           // <--- всю высоту родителя (60px)
              width: "auto",            // wrap_content по ширине
              display: "block"
            }}
          />
        </div>
        <div>
          <div style={{
            fontSize: 16,
            color: '#292929',
            opacity: 0.9,
            lineHeight: 1.18
          }}>
            Печатно–производственная <br />
            компания. Большие тиражи!
          </div>
        </div>
      </div>
      <div style={{
        textAlign: "right",
        fontSize: 17,
        color: "#272727",
        minWidth: 260
      }}>
        г. Санкт-Петербург, ул. Ольги Берггольц, 35А,<br />
        10:00 – 18:00 с пн. по пт.
      </div>
    </header>
  );
}
