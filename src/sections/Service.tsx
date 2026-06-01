import type { Theme } from "../context/ThemeContext";

const toSvgDataUri = (svg: string) => `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;

const serviceOuterImageByTheme: Record<Theme, string> = {
  wireframe: toSvgDataUri(
    `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 800'><rect width='1200' height='800' fill='#f8fafc'/><g fill='#cbd5e1'><rect x='90' y='130' width='300' height='180' rx='18'/><rect x='430' y='230' width='360' height='220' rx='18'/><rect x='820' y='130' width='280' height='160' rx='18'/></g></svg>`
  ),
  dark: toSvgDataUri(
    `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 800'><rect width='1200' height='800' fill='#1e1b4b'/><g fill='#312e81'><rect x='90' y='130' width='300' height='180' rx='18'/><rect x='430' y='230' width='360' height='220' rx='18'/><rect x='820' y='130' width='280' height='160' rx='18'/></g></svg>`
  ),
  cybernoir: toSvgDataUri(
    `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 800'><defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'><stop offset='0%' stop-color='#312e81'/><stop offset='100%' stop-color='#831843'/></linearGradient></defs><rect width='1200' height='800' fill='url(#g)'/><g fill='#db2777' opacity='0.55'><rect x='90' y='130' width='300' height='180' rx='18'/><rect x='430' y='230' width='360' height='220' rx='18'/><rect x='820' y='130' width='280' height='160' rx='18'/></g></svg>`
  ),
  holographic: toSvgDataUri(
    `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 800'><rect width='1200' height='800' fill='#efe8d8'/><rect x='40' y='40' width='1120' height='720' fill='none' stroke='#111' stroke-width='16'/><rect x='120' y='160' width='260' height='220' fill='#111'/><rect x='460' y='220' width='300' height='270' fill='#111'/><rect x='820' y='140' width='250' height='210' fill='#111'/></svg>`
  ),
  retro80: toSvgDataUri(
    `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 800'><rect width='1200' height='800' fill='#241b2f'/><g fill='#ff6ec7' opacity='0.5'><rect x='90' y='130' width='300' height='180' rx='18'/><rect x='430' y='230' width='360' height='220' rx='18'/><rect x='820' y='130' width='280' height='160' rx='18'/></g><g fill='#5af2ff' opacity='0.35'><rect x='70' y='500' width='1060' height='120' rx='24'/></g></svg>`
  ),
};

const serviceInnerImageByTheme: Record<Theme, string> = {
  wireframe: toSvgDataUri(
    `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 640 380'><rect width='640' height='380' fill='#f1f5f9'/><rect x='24' y='24' width='592' height='332' rx='16' fill='#e2e8f0'/><rect x='68' y='90' width='220' height='18' rx='9' fill='#64748b'/><rect x='68' y='126' width='170' height='14' rx='7' fill='#94a3b8'/><circle cx='470' cy='190' r='84' fill='#94a3b8'/></svg>`
  ),
  dark: toSvgDataUri(
    `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 640 380'><rect width='640' height='380' fill='#0f172a'/><rect x='24' y='24' width='592' height='332' rx='16' fill='#1e293b'/><rect x='68' y='90' width='220' height='18' rx='9' fill='#cbd5e1'/><rect x='68' y='126' width='170' height='14' rx='7' fill='#94a3b8'/><circle cx='470' cy='190' r='84' fill='#334155'/></svg>`
  ),
  cybernoir: toSvgDataUri(
    `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 640 380'><rect width='640' height='380' fill='#1e1b4b'/><rect x='24' y='24' width='592' height='332' rx='16' fill='#312e81'/><rect x='68' y='90' width='220' height='18' rx='9' fill='#f472b6'/><rect x='68' y='126' width='170' height='14' rx='7' fill='#a78bfa'/><circle cx='470' cy='190' r='84' fill='#db2777'/></svg>`
  ),
  holographic: toSvgDataUri(
    `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 640 380'><rect width='640' height='380' fill='#f7f7f7'/><rect x='22' y='22' width='596' height='336' fill='none' stroke='#111' stroke-width='10'/><rect x='52' y='80' width='220' height='28' fill='#111'/><rect x='52' y='128' width='170' height='20' fill='#111'/><rect x='332' y='110' width='236' height='178' fill='#111'/></svg>`
  ),
  retro80: toSvgDataUri(
    `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 640 380'><rect width='640' height='380' fill='#1d1630'/><rect x='24' y='24' width='592' height='332' rx='16' fill='#2a1f46'/><rect x='68' y='90' width='220' height='18' rx='9' fill='#ff6ec7'/><rect x='68' y='126' width='170' height='14' rx='7' fill='#5af2ff'/><circle cx='470' cy='190' r='84' fill='#f9a8ff'/></svg>`
  ),
};

const ServiceOuterContent = ({ theme }: { theme: Theme }) => (
  <div className="service-theme section-theme-bg relative h-full w-full overflow-hidden">
    <img
      src={serviceOuterImageByTheme[theme]}
      alt="Service themed display"
      className="h-0 w-0 object-cover"
    />
  </div>
);

const ServiceInnerContent = ({ theme }: { theme: Theme }) => (
  <div className="service-theme section-theme-bg relative flex h-full w-full flex-col items-start justify-end p-8 pb-18">
    <div className="section-theme-panel mb-6 w-full max-w-lg rounded-2xl border p-3 backdrop-blur-sm">
      <img
        src={serviceInnerImageByTheme[theme]}
        alt="Service UI themed image"
        className="h-auto w-full rounded-xl"
      />
    </div>
    <p className="section-theme-sub mb-2 font-mono text-xs uppercase tracking-widest">
      01 — Services
    </p>
    <h2 className="section-theme-text text-5xl font-bold leading-none tracking-tight lg:text-7xl">
      What I do
    </h2>
    <ul className="section-theme-sub mt-6 space-y-2 text-sm">
      <li>→ Web design & development</li>
      <li>→ Interactive UI & motion</li>
      <li>→ Brand systems & identity</li>
    </ul>
  </div>
);

type SectionThemeProps = {
  theme: Theme;
};

const ServiceOuter = ({ theme }: SectionThemeProps) => <ServiceOuterContent theme={theme} />;

const ServiceInner = ({ theme }: SectionThemeProps) => <ServiceInnerContent theme={theme} />;

const Service = { Outer: ServiceOuter, Inner: ServiceInner };
export default Service;
