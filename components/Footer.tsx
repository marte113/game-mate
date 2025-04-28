import Link from "next/link";
import Image from "next/image";

import config from "@/config";
import logo from "@/app/icon.png";

// 사업자 관련 정보
const companyInfo = {
  name: "수파 스타트업",
  company_number: "123-45-67890",
  selling_number: "제2024-서울-00000호",
  owner: "김수파",
  address:
    "서울특별시 강남구 테헤란로 14길 6 남도빌딩 4층 401호(삼성동, 남도빌딩)",
  email: "supa@supastartup.com",
};

const Footer = () => {
  return (
    <footer className="bg-base-content border-t border-base-content/10 text-white">
      <div className="w-full mx-auto px-8 py-24">
        <div className=" flex lg:items-start md:flex-row md:flex-nowrap flex-wrap flex-col">
          <div className="w-64 flex-shrink-0 md:mx-0 mx-auto text-center md:text-left">
            <Link
              href="/#"
              aria-current="page"
              className="flex gap-2 justify-center md:justify-start items-center "
            >
              <Image
                src={logo}
                alt={`${config.appName} logo`}
                priority={true}
                className="w-6 h-6"
                width={24}
                height={24}
              />
              <strong className="font-extrabold tracking-tight text-base md:text-lg">
                {config.appName}
              </strong>
            </Link>
            {/* 앱 설명 */}
            <p className="mt-3 text-sm text-white">{config.appDescription}</p>

            <p className="mt-3 text-sm text-gray-500">
              Copyright © {new Date().getFullYear()} - All rights reserved
            </p>
            {/* 사업자 정보 */}
            <p className="mt-3 text-sm text-gray-500">
              {companyInfo.name} | 사업자등록번호 : {companyInfo.company_number}{" "}
              | 대표자명 : {companyInfo.owner}
            </p>
          </div>
          <div className="flex-grow flex flex-wrap justify-center -mb-10 md:mt-0 mt-10 text-center">
            <div className="lg:w-1/3 md:w-1/2 w-full px-4">
              <div className="footer-title font-semibold text-primary tracking-widest text-sm md:text-left mb-3">
                LINKS
              </div>

              <div className="flex flex-col justify-center items-center md:items-start gap-2 mb-10 text-sm">
                {config.supportEmail && (
                  <a
                    href={`mailto:${config.supportEmail}`}
                    target="_blank"
                    className="link link-hover"
                    aria-label="Contact Support"
                  >
                    이메일로 문의하기
                  </a>
                )}
                <Link href="/#pricing" className="link link-hover">
                  가격
                </Link>
                <Link href="/blog" className="link link-hover">
                  블로그
                </Link>
              </div>
            </div>

            <div className="lg:w-1/3 md:w-1/2 w-full px-4">
              <div className="footer-title font-semibold text-primary tracking-widest text-sm md:text-left mb-3">
                LEGAL
              </div>

              <div className="flex flex-col justify-center items-center md:items-start gap-2 mb-10 text-sm">
                <Link href="/tos" className="link link-hover">
                  이용약관
                </Link>
                <Link href="/privacy-policy" className="link link-hover">
                  개인정보처리방침
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
