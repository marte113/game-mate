import { Button } from "@/components/ui";

export default function TokenChargeButton({ openChargeModal }: { openChargeModal: () => void }) {
    return (
        <Button variant="default" size="sm" onClick={openChargeModal}>
            토큰 충전
        </Button>
    );
}
