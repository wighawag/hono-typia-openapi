import ts from "typescript";
import { IJsonApplication } from "typia";
import { MetadataCollection } from "typia/lib/factories/MetadataCollection";
import { MetadataFactory } from "typia/lib/factories/MetadataFactory";
import { JsonApplicationProgrammer } from "typia/lib/programmers/json/JsonApplicationProgrammer";
import type { Metadata } from "typia/lib/schemas/metadata/Metadata";

export function createOpenAPISchema<Version extends "3.0" | "3.1">(
  openapiVersion: Version,
  checker: ts.TypeChecker,
  types: ts.Type[],
) {
  const collection = new MetadataCollection({
    replace: MetadataCollection.replace,
  });

  const results = types.map((t) =>
    MetadataFactory.analyze(checker)({
      escape: true,
      constant: true,
      absorb: false,
      validate: JsonApplicationProgrammer.validate,
    })(collection)(t),
  );
  if (results.some((r) => !r.success)) {
    throw new Error("Failed to analyze metadata");
  }

  return JsonApplicationProgrammer.write(openapiVersion)(
    results.map((r) => (r as { data: Metadata }).data),
  ) as IJsonApplication<Version>;
}