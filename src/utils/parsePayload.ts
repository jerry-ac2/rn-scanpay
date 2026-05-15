export const parsePayload = ({
  payload,
}: {
  payload: string | object | null;
}): object | null => {
  try {
    if (typeof payload === 'string') {
      return JSON.parse(payload);
    }
    if (typeof payload === 'object' && payload !== null) {
      return payload;
    }

    return null;
  } catch (error) {
    console.error('Error parsing payload', error);
    return null;
  }
};
