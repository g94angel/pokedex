import React from "react";
import { render } from "@testing-library/react";
import Pokeball from "../components/Pokeball";

test("renders Pokeball component", () => {
  const { container } = render(<Pokeball />);
  const pokeball = container.querySelector(".pokeball");
  expect(pokeball).toBeInTheDocument();
});
