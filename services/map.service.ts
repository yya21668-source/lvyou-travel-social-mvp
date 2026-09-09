import type { MapService } from "./contracts";
export const mockMapService: MapService = { async searchPoi(keyword, city="大理") { return [{ id:"mock-poi", name:keyword||"洱海生态廊道", address:`${city} · Mock 地址` }]; } };
// V2: 在这里接入高德 Web Service，页面层无需修改。
