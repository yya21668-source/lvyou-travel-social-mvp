/**
 * 地图服务抽象层
 * MVP阶段使用 mock.provider（静态数据），V2 填入高德开放平台 key 即切换真实地图
 * 使用方式：import { mapProvider } from '@/lib/map/provider'
 */

export interface PoiCoordinate {
  lng: number;
  lat: number;
}

export interface MapProvider {
  readonly name: string;
  /** 地理编码：地址 → 坐标 */
  geocode(address: string): Promise<PoiCoordinate | null>;
  /** 静态地图图URL（卡片缩略图用） */
  staticMap(center: PoiCoordinate, zoom?: number): string;
  /** POI 周边搜索（V2） */
  searchNearby?(keyword: string, center: PoiCoordinate): Promise<unknown[]>;
}

/** mock 实现：确定性伪坐标 + 渐变占位图 */
class MockMapProvider implements MapProvider {
  readonly name = "mock";
  async geocode(address: string): Promise<PoiCoordinate | null> {
    let h = 0;
    for (const c of address) h = (h * 131 + c.charCodeAt(0)) % 100003;
    return {
      lng: 100 + (h % 3000) / 100,
      lat: 22 + (h % 2000) / 100,
    };
  }
  staticMap(_center: PoiCoordinate, _zoom?: number): string {
    return "/map-placeholder.svg";
  }
}

/** 高德实现：V2 接入时补充。注册 key: NEXT_PUBLIC_AMAP_KEY */
class AmapProvider implements MapProvider {
  readonly name = "amap";
  constructor(private key: string) {}
  async geocode(address: string): Promise<PoiCoordinate | null> {
    // V2需接入：https://restapi.amap.com/v3/geocode/geo?key=...&address=...
    throw new Error("V2需接入高德地理编码API");
  }
  staticMap(center: PoiCoordinate, zoom = 13): string {
    // V2需接入：https://restapi.amap.com/v3/staticmap?markers=...
    return `/map-placeholder.svg?mock=1&lng=${center.lng}&lat=${center.lat}&zoom=${zoom}`;
  }
}

const amapKey = process.env.NEXT_PUBLIC_AMAP_KEY;

/** 当前生效的地图Provider：配置了高德key则自动切换 */
export const mapProvider: MapProvider = amapKey
  ? new AmapProvider(amapKey)
  : new MockMapProvider();
