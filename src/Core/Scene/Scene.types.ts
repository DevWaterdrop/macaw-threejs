import { SCENE_TYPE } from "../../constants";

export type SceneSettings = {
	alpha?: boolean;
	color?: number;
	maxDPR?: number;
	type?: SCENE_TYPE;
};

export type Dimensions = {
	width: number;
	height: number;
};
