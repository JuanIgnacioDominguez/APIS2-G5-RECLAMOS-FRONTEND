const JAWG_TOKEN = import.meta.env.VITE_JAWG_ACCESS_TOKEN as string | undefined;

export interface TileConfig {
  url: string;
  attribution: string;
  subdomains: string;
  maxZoom: number;
}

export const TILES: TileConfig = JAWG_TOKEN
  ? {
      url: `https://tile.jawg.io/jawg-lagoon/{z}/{x}/{y}{r}.png?access-token=${JAWG_TOKEN}`,
      attribution:
        '<a href="https://www.jawg.io" target="_blank" rel="noreferrer">&copy; Jawg</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      subdomains: "abcd",
      maxZoom: 22,
    }
  : {
      url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      subdomains: "abc",
      maxZoom: 19,
    };
