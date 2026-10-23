import { Config } from "@remotion/cli/config";

Config.setVideoImageFormat("jpeg");
Config.setOverwriteOutput(true);
// h264 usa CRF 18 por defecto; no se fija aquí porque rompería los renders de solo audio (--codec=wav).
Config.setCodec("h264");
// Studio y exportación en puertos distintos: con Studio abierto en el 3000, un render por comando que use el mismo
// puerto encuentra la página de Studio y falla ("window.getStaticCompositions is undefined").
Config.setStudioPort(3000);
Config.setRendererPort(3123);
