export const enum Css {
  BackupSuffix = 'bak',
  Token = '\u002F\u002A__COLORFUL_TITLEBAR_KASUKABETSUMUGI__\u002A\u002F',
  Selector = '#workbench\u005C\u002Eparts\u005C\u002Etitlebar::after',
}

export const enum AfterStyle {
  BrightCenter = `${Css.Selector}{
      content: "";
      position: absolute;
      top: 50%;
      left: 50%;
      width: 100%;
      height: 100%;
      transform: translate(-50%, -50%);
      background: linear-gradient(to right, rgba(5, 5, 5, 0.28) 0%, rgba(255, 255, 255, 0.48) 50%, transparent 80%);
      mix-blend-mode: overlay;
      pointer-events: none;
    }`,
  BrightLeft = `${Css.Selector}{
      content: "";
      position: absolute;
      top: 50%;
      left: 50%;
      width: 100%;
      height: 100%;
      transform: translate(-50%, -50%);
      background: radial-gradient(circle at 15% 50%, rgba(255, 255, 255, 0.28) 0%, transparent 24%, rgba(5, 5, 5, 0.48) 50%, transparent 80%);
      mix-blend-mode: overlay;
      pointer-events: none;
    }`,
  ArcLeft = `${Css.Selector}{
      content: '';
      position: absolute;
      width: 200%;
      height: 269%;
      top: -56%;
      left: -6%;
      background: radial-gradient(ellipse, rgba(5, 5, 5, 0) 0%, rgba(255, 255, 255, 0.25) 50%, rgba(255, 255, 255, 0.82) 65%);
      pointer-events: none;
      mix-blend-mode: overlay;
    }`,
}
