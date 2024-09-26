import yaml from 'js-yaml';

export function convertJsonToYaml(json: Record<string, unknown>): string {
  return yaml.dump(json, {
    indent: 2,
    noRefs: true,
    noArrayIndent: true,
    lineWidth: -1,
  });
}
