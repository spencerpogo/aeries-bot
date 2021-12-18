{ pkgs ? import <nixpkgs> { } }:
pkgs.mkShell {
  # nativeBuildInputs is usually what you want -- tools you need to run
  nativeBuildInputs =
    [ pkgs.nodejs-17_x pkgs.nodePackages.yarn pkgs.nodePackages.prisma ];
  shellHook = with pkgs; ''
    export PRISMA_MIGRATION_ENGINE_BINARY="${prisma-engines}/bin/migration-engine"
    export PRISMA_QUERY_ENGINE_BINARY="${prisma-engines}/bin/query-engine"
    export PRISMA_QUERY_ENGINE_LIBRARY="${prisma-engines}/lib/libquery_engine.node"
    export PRISMA_INTROSPECTION_ENGINE_BINARY="${prisma-engines}/bin/introspection-engine"
    export PRISMA_FMT_BINARY="${prisma-engines}/bin/prisma-fmt"
  '';
}
