export type DefaultFreePlan = {
  name: "free";
  price: 0;
  storageMb: 500;
  videoLimit: 10;
  durationDays: 30;
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
