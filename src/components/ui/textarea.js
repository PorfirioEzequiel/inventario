const Textarea = ({ ...props }) => (
  <textarea
    className="border rounded px-2 py-1 w-full"
    rows={3}
    {...props}
  />
);
export default Textarea;
