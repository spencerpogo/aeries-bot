{ pkgs ? import <nixpkgs> { } }:
pkgs.mkShell {
  # nativeBuildInputs is usually what you want -- tools you need to run
  nativeBuildInputs =
    [ pkgs.nodejs-17_x pkgs.nodePackages.yarn pkgs.nodePackages.prisma ];
}
