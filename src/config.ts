import envSchema from "env-schema";
import S from "fluent-json-schema";

type ConfigData = {
  TOKEN: string;
};

const schema = S.object().prop("TOKEN", S.string().required());

export const CONFIG = envSchema<ConfigData>({ schema });
