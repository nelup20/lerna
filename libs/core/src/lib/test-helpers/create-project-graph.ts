import { ProjectGraphDependency, ProjectGraphProjectNode } from "@nx/devkit";
import { Package, RawManifest } from "../package";
import {
  ProjectGraphProjectNodeWithPackage,
  ProjectGraphWithPackages,
  ProjectGraphWorkspacePackageDependency,
} from "../project-graph-with-packages";

export function projectNode(
  projectNode: Partial<ProjectGraphProjectNode>,
  pkg?: Partial<RawManifest>
): ProjectGraphProjectNodeWithPackage {
  return {
    ...(projectNode as ProjectGraphProjectNode),
    package: pkg ? new Package(pkg as RawManifest, `/test/packages/${pkg.name}`, "/test") : null,
  };
}

export function projectGraphDependency(
  dep: Partial<ProjectGraphWorkspacePackageDependency>
): ProjectGraphWorkspacePackageDependency {
  return dep as ProjectGraphWorkspacePackageDependency;
}

export function createProjectGraph<T extends ProjectGraphProjectNode>({
  projects,
  dependencies,
}: {
  projects: T[];
  dependencies: (ProjectGraphDependency | ProjectGraphWorkspacePackageDependency)[];
}): ProjectGraphWithPackages {
  return {
    nodes: projects.reduce((acc, project) => ({ ...acc, [project.name]: project }), {}),
    dependencies: dependencies.reduce(
      (prev, next) => ({
        ...prev,
        [next.source]: [...(prev[next.source] || []), next],
      }),
      {} as Record<string, ProjectGraphDependency[]>
    ),
    localPackageDependencies: dependencies
      .filter(
        (deps) => (deps as ProjectGraphWorkspacePackageDependency).targetVersionMatchesDependencyRequirement
      )
      .reduce(
        (prev, next) => ({
          ...prev,
          [next.source]: [...(prev[next.source] || []), next as ProjectGraphWorkspacePackageDependency],
        }),
        {} as Record<string, ProjectGraphWorkspacePackageDependency[]>
      ),
  };
}
