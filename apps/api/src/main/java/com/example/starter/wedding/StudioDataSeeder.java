package com.example.starter.wedding;

import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class StudioDataSeeder implements CommandLineRunner {

  private final PhotographerRepository photographerRepository;
  private final PortfolioPhotoRepository portfolioPhotoRepository;

  public StudioDataSeeder(
      PhotographerRepository photographerRepository,
      PortfolioPhotoRepository portfolioPhotoRepository) {
    this.photographerRepository = photographerRepository;
    this.portfolioPhotoRepository = portfolioPhotoRepository;
  }

  @Override
  public void run(String... args) {
    if (photographerRepository.count() > 0) {
      return;
    }

    Photographer yuna = photographerRepository.save(new Photographer(
        "한유나",
        "Lead Photographer",
        "부드러운 자연광과 작은 표정을 오래 남기는 작가입니다.",
        "Natural Light",
        "서울 / 경기",
        9,
        850000,
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=900&q=80"));

    Photographer minjun = photographerRepository.save(new Photographer(
        "서민준",
        "Editorial Photographer",
        "영화적인 구도와 차분한 컬러로 한 장면 같은 웨딩을 만듭니다.",
        "Editorial",
        "전국 출장",
        7,
        980000,
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=900&q=80"));

    Photographer hae = photographerRepository.save(new Photographer(
        "정하은",
        "Film Mood Photographer",
        "필름 질감, 우드톤 공간, 담백한 포즈를 좋아하는 커플에게 잘 맞습니다.",
        "Film Mood",
        "서울 / 제주",
        6,
        780000,
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=900&q=80"));

    portfolioPhotoRepository.save(new PortfolioPhoto(
        "오전의 우드 스튜디오",
        "calm",
        "Han Studio Room A",
        "Spring",
        "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1400&q=82",
        true,
        yuna));
    portfolioPhotoRepository.save(new PortfolioPhoto(
        "창가의 베일",
        "soft",
        "Han Studio Window Hall",
        "Winter",
        "https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=1400&q=82",
        true,
        hae));
    portfolioPhotoRepository.save(new PortfolioPhoto(
        "도시의 늦은 오후",
        "editorial",
        "Seoul City Walk",
        "Autumn",
        "https://images.unsplash.com/photo-1529636798458-92182e662485?auto=format&fit=crop&w=1400&q=82",
        false,
        minjun));
    portfolioPhotoRepository.save(new PortfolioPhoto(
        "화이트 드레스 포트레이트",
        "classic",
        "Han Studio White Room",
        "Summer",
        "https://images.unsplash.com/photo-1606800052052-a08af7148866?auto=format&fit=crop&w=1400&q=82",
        false,
        yuna));
    portfolioPhotoRepository.save(new PortfolioPhoto(
        "필름 컬러 세레모니",
        "film",
        "Jeju Garden",
        "Spring",
        "https://images.unsplash.com/photo-1469371670807-013ccf25f16a?auto=format&fit=crop&w=1400&q=82",
        false,
        hae));
    portfolioPhotoRepository.save(new PortfolioPhoto(
        "나무 테이블 위 부케",
        "detail",
        "Han Studio Lounge",
        "Autumn",
        "https://images.unsplash.com/photo-1523438885200-e635ba2c371e?auto=format&fit=crop&w=1400&q=82",
        false,
        minjun));
  }
}
