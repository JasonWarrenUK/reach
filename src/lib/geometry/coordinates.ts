// Ported from reach-of-surrentum.jsx (lines 784-815).
// Great-circle geometry, framework-agnostic.

import { PLACES } from "$lib/data/places";
import { NODES } from "$lib/data/nodes";

export const HOME = PLACES[0];
export const R_EARTH = 6371;

export function rad(d: number): number {
	return (d * Math.PI) / 180;
}

export function gcKm(lon1: number, lat1: number, lon2: number, lat2: number): number {
	const dLat = rad(lat2 - lat1);
	const dLon = rad(lon2 - lon1);
	const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(lat1)) * Math.cos(rad(lat2)) * Math.sin(dLon / 2) ** 2;
	return 2 * R_EARTH * Math.asin(Math.sqrt(h));
}

export function bearingDeg(lon1: number, lat1: number, lon2: number, lat2: number): number {
	const dLon = rad(lon2 - lon1);
	const y = Math.sin(dLon) * Math.cos(rad(lat2));
	const x = Math.cos(rad(lat1)) * Math.sin(rad(lat2)) - Math.sin(rad(lat1)) * Math.cos(rad(lat2)) * Math.cos(dLon);
	return (Math.atan2(y, x) * 180) / Math.PI;
}

export function N(k: string): [number, number] {
	return NODES[k];
}

export function kmBetween(a: [number, number], b: [number, number]): number {
	return gcKm(a[0], a[1], b[0], b[1]);
}

export function nodeKm(a: string, b: string): number {
	return kmBetween(N(a), N(b));
}

export function fromHomeKm(lon: number, lat: number): number {
	return gcKm(HOME.lon, HOME.lat, lon, lat);
}

export function fromHomeBearing(lon: number, lat: number): number {
	return bearingDeg(HOME.lon, HOME.lat, lon, lat);
}

/** Destination lon/lat given a start, a bearing and a distance. */
export function destination(lon: number, lat: number, bearing: number, km: number): [number, number] {
	const d = km / R_EARTH;
	const b = rad(bearing);
	const la1 = rad(lat);
	const lo1 = rad(lon);
	const la2 = Math.asin(Math.sin(la1) * Math.cos(d) + Math.cos(la1) * Math.sin(d) * Math.cos(b));
	const lo2 = lo1 + Math.atan2(Math.sin(b) * Math.sin(d) * Math.cos(la1), Math.cos(d) - Math.sin(la1) * Math.sin(la2));
	return [(lo2 * 180) / Math.PI, (la2 * 180) / Math.PI];
}
