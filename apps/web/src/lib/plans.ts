export type DefaultFreePlan = {
  name: "free";
  price: 0;
  storageMb: 500;
  videoLimit: 10;
  durationDays: 30;
};

export type PlanDefinition = {
  name: string;
  price: number;
  storageMb: number;
  videoLimit: number;
  durationDays: number;
};

export function getDefaultFreePlan(): DefaultFreePlan {
  return {
    name: "free",
    price: 0,
    storageMb: 500,
    videoLimit: 10,
    durationDays: 30
  };
}

export function getAvailablePlans(): PlanDefinition[] {
  return [
    getDefaultFreePlan(),
    {
      name: "starter",
      price: 199000,
      storageMb: 2_000,
      videoLimit: 50,
      durationDays: 30
    },
    {
      name: "pro",
      price: 499000,
      storageMb: 10_000,
      videoLimit: 250,
      durationDays: 90
    }
  ];
}
