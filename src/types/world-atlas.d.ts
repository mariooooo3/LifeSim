declare module "world-atlas/countries-110m.json" {
  import type { Topology } from "topojson-specification";
  const data: Topology & {
    objects: {
      countries: { type: "GeometryCollection" };
      land: { type: "GeometryCollection" };
    };
  };
  export default data;
}
